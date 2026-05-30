# Node Configuration Guide

This guide walks through every node group in `01-main-ai-video-pipeline.json`, what it does, what to configure, and how to test it. Read end-to-end before flipping the workflow active.

---

## 0. Credentials you need in n8n

Create these in **Settings -> Credentials** before importing the workflow:

| Credential name (in n8n) | Type | Used by |
|---|---|---|
| `Google Service Account` | Google API -> Service Account | Sheets, Drive, Vertex AI, GCS download |
| `YouTube OAuth2` | YouTube OAuth2 API | YouTube Short upload node |
| `SMTP` | SMTP | Error handler email node |

For the service account:
1. Create one in GCP Console -> IAM -> Service Accounts.
2. Grant roles: `Vertex AI User`, `Storage Object Admin` (only on the Veo bucket), `Editor` on your Drive folder + Sheet (share via email, not IAM).
3. Download the JSON key. Paste its full content into the n8n credential dialog (or mount the file at the path in `GOOGLE_APPLICATION_CREDENTIALS` and use the file mode).
4. Enable required APIs in your GCP project: `aiplatform.googleapis.com`, `sheets.googleapis.com`, `drive.googleapis.com`, `storage.googleapis.com`, `generativelanguage.googleapis.com`.

For YouTube OAuth2:
1. In Google Cloud Console, create an OAuth 2.0 Client ID (type: Web application).
2. Authorized redirect URI: `https://YOUR-N8N-DOMAIN/rest/oauth2-credential/callback`.
3. In n8n, fill the credential and click **Connect**, sign in with the YouTube channel owner account.

For Facebook (no n8n credential needed - we use the Page Access Token directly via `$env.FB_PAGE_ACCESS_TOKEN`):
1. In Meta for Developers, create a Business app.
2. Add the **Pages** product, request `pages_manage_posts`, `pages_read_engagement`, `publish_video` permissions.
3. Get a long-lived Page access token via the Graph API Explorer.

---

## 1. Schedule Trigger (8AM/1PM/7PM)

- Cron expression is read from `$env.CRON_SCHEDULE`.
- Default `0 8,13,19 * * *` = three runs per day in the timezone set by `TZ` / `GENERIC_TIMEZONE`.
- To change the schedule **without editing the workflow**, just update the env var and restart n8n.

---

## 2. Load Character Memory (Code node)

- Returns a frozen object with `Leo`, `Mom (Sarah)`, `Dad (Daniel)`, and `Max`.
- Every downstream prompt receives the exact same character description -> **visual consistency** across videos.
- Edit this node only if you want to change canonical character details (e.g. Leo turning 4).

---

## 3. Read Existing Ideas (Dedup) -> Prepare Dedup Context

- Reads the `Ideas` tab and pulls all historical `title` values.
- The next Code node lower-cases and trims them so the Gemini prompt can avoid repeats.
- The dedup check itself runs in **Parse + Dedup Check** after Gemini returns: it throws an error if the new title fuzzy-matches any historical one, which routes the run to the error handler.

---

## 4. Gemini: Generate Idea

- HTTP Request to `generativelanguage.googleapis.com/v1beta/models/$GEMINI_TEXT_MODEL:generateContent`.
- Forces `responseMimeType: application/json` for strict JSON output.
- Niche is rotated by `Load Character Memory` based on the hour-of-day plus a small random component.
- Retries 3x on transient failure with 5s back-off.

---

## 5. Save Idea to Sheets

- Appends to the `Ideas` tab.
- Status starts as `idea_created`. The `Videos` tab gets the final published record at the end of the run.

---

## 6. Gemini: Build Veo Prompt

- Receives the idea + the full character memory and produces a single dense cinematic prompt.
- The system prompt enforces all 8 elements you asked for: character, environment, camera, lighting, emotion, action, visual style, audio cues.
- Returns `{ veo_prompt, negative_prompt, aspect_ratio, duration_seconds }`.
- Aspect ratio is locked to `9:16` because we are publishing Shorts/Reels.

---

## 7. Vertex AI Veo: Submit Job

- Calls `:predictLongRunning` on the Veo model. This is asynchronous - it returns an operation name.
- `personGeneration: allow_adult` is required for clips containing people. Toddler footage is allowed under this flag in Veo's policy at the time of writing - **review Google's current usage policy before going live**.
- `storageUri` points to a GCS bucket prefix the service account can write to. Veo writes the rendered MP4 there.

### Important env vars
- `VERTEX_PROJECT_ID` - your GCP project id (not number).
- `VERTEX_LOCATION` - e.g. `us-central1`.
- `VEO_MODEL_ID` - update this when Google ships a newer Veo version.
- `VERTEX_OUTPUT_BUCKET` - bucket name without `gs://` prefix.

---

## 8. Init Poll State -> Wait 30s -> Vertex AI Veo: Poll Status -> Evaluate Poll -> Veo Done?

This is the **polling loop**. It calls `:fetchPredictOperation` every 30 seconds. When the operation comes back with `done: true`:
- On success it extracts the `gcsUri` of the rendered video.
- On error it throws and routes to the error handler.

Tunables:
- `VEO_MAX_POLL_ATTEMPTS` - default 40, so worst case is 20 minutes of polling. Increase if Veo is queueing.

---

## 9. Build GCS Download URL -> Download Video from GCS

- Converts `gs://bucket/path/file.mp4` into a JSON-API media download URL and pulls the binary into n8n using the same service-account credential.
- The binary stays in memory under the property name `data` for downstream uploads.

---

## 10. Gemini: Generate Metadata -> Parse Metadata

- One Gemini call produces YT title, YT description, FB caption, and 12-15 hashtags - all family-friendly, human-sounding, no clickbait.
- Hashtag array is normalized so each tag starts with `#`.

---

## 11. Upload to Google Drive -> Merge Drive Info

- Uses the n8n Google Drive node.
- Filename pattern: `{run_id}_{slugified_title}.mp4`.
- Make sure the destination folder is **shared with the service account email**.

---

## 12. YouTube: Upload Short

- The native n8n YouTube node accepts the binary `data` and metadata.
- `privacyStatus: private` + `publishAt = now + 15 min` -> the video goes live 15 minutes later. Adjust the offset in the `publishAt` expression if you want different scheduling.
- Tags come from the hashtag array stripped of `#`.

> Tip: To make YouTube treat it as a **Short**, the source video must be vertical (9:16) and <= 60 seconds. Veo 3 outputs 8s by default, well within the limit.

---

## 13. Facebook: Init Reel Upload -> Upload Binary -> Publish Reel

Three-step Reels upload as required by the Graph API:
1. **Init** (`upload_phase=start`) - returns `video_id` + `upload_url`.
2. **Upload binary** to `rupload.facebook.com/video-upload/v21.0/{video_id}` with the binary stream and the `OAuth ${token}` header.
3. **Publish** with `upload_phase=finish`, `video_state=SCHEDULED`, `scheduled_publish_time=unix_seconds`, plus the description/caption.

If you want immediate publish, set `video_state=PUBLISHED` and remove `scheduled_publish_time`.

---

## 14. Aggregate Upload Results -> Save Video Record -> Log: Success

- Both upload branches converge here. If either platform succeeds, `final_status = published`. If both fail, the Collect Error path will already have routed to the error handler.
- A single record per run is appended to the `Videos` tab and a SUCCESS line to `Logs`.

---

## 15. Collect Error -> Trigger Error Handler

- Every node with `onError: continueErrorOutput` has a second output. They all converge into `Collect Error` and call the error handler sub-workflow.
- Paste the imported error-handler workflow's id into `ERROR_HANDLER_WORKFLOW_ID` after first import.

---

## Manual test checklist

Before activating the schedule:

1. **Disable the Schedule Trigger node**, then open the workflow and click **Execute Workflow** to do a single manual run.
2. Watch each step. The first time you may need to authorize the YouTube credential interactively.
3. Verify rows land in `Ideas`, `Videos`, and `Logs`.
4. Verify the video shows up in your Drive folder.
5. Verify YouTube and Facebook show a **scheduled** post.
6. Re-enable the Schedule Trigger node and toggle the workflow to **Active**.
