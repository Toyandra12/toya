# AI Video Channel - Autonomous n8n Pipeline

Fully autonomous AI video factory built on **n8n**. Every cron tick it generates a fresh idea, writes a cinematic Veo prompt, renders the video on Vertex AI, writes SEO copy, archives to Drive, and schedules the result on **YouTube Shorts** and **Facebook Reels** - with consistent recurring characters, deduplication, retry, alerting, and a live dashboard. Designed to run 24/7 on a small VPS without you touching it.

---

## Recurring cast (consistent across every video)

| Character | Description |
|---|---|
| **Leo** | 3-year-old toddler. Soft blonde hair, bright sky-blue eyes, round chubby cheeks, fair skin, pastel blue tee + beige overalls. Curious, playful, gentle giggle. |
| **Mom (Sarah)** | Late 20s, long wavy chestnut-brown hair, cream cardigan, warm smile. |
| **Dad (Daniel)** | Early 30s, short dark-brown hair, light stubble, navy henley. |
| **Max** | Friendly Golden Retriever family dog, red collar, gentle and protective. |

These definitions live in the **Load Character Memory** Code node (`workflows/01-main-ai-video-pipeline.json`). Every generated Veo prompt receives them verbatim, which is what keeps Leo looking like Leo across every clip.

---

## Niches in rotation

`toddler stories`, `family stories`, `funny situations`, `emotional stories`, `animal friendships`, `school life`, `road trips`, `market adventures`. The niche for each run is chosen pseudo-randomly weighted by hour-of-day so the channel feels naturally varied.

---

## Repository layout

```
n8n-ai-video-channel/
+- workflows/
|  +- 01-main-ai-video-pipeline.json   # the brain: schedule -> idea -> prompt -> Veo -> upload
|  +- 02-error-handler.json            # central retry+notify sub-workflow
|  +- 03-dashboard.json                # HTML dashboard served from a webhook
+- docs/
|  +- NODE_CONFIGURATION.md            # every node explained
|  +- DEPLOYMENT.md                    # zero-to-running playbook
|  +- VPS_HOSTING.md                   # provider sizing, hardening, monitoring
|  +- ERROR_HANDLING.md                # retry / log / alert architecture
+- sheets/
|  +- google-sheets-template.md        # 4-tab Sheet schema + Apps Script setup
+- docker/
|  +- Dockerfile                       # optional ffmpeg-enabled n8n image
|  +- Caddyfile                        # auto-HTTPS reverse proxy
+- scripts/
|  +- bootstrap-vps.sh                 # one-shot Ubuntu 22.04 hardening
+- docker-compose.yml                  # n8n + Postgres + (optional) Caddy
+- .env.example                        # all configuration in env vars
+- README.md                           # you are here
```

---

## High-level pipeline

```
                           +---------------------------+
                           | Schedule Trigger          |
                           | cron: 0 8,13,19 * * *     |
                           +-------------+-------------+
                                         |
                       +-----------------v-----------------+
                       | Load Character Memory (Leo + co.) |
                       +-----------------+-----------------+
                                         |
                  +----------------------+----------------------+
                  | Read Existing Ideas (Sheets) -> Dedup ctx   |
                  +----------------------+----------------------+
                                         |
              +--------------------------v--------------------------+
              | Gemini: Generate viral idea (niche-targeted, JSON)  |
              +--------------------------+--------------------------+
                                         | dedup OK?
                                         v
                       +-----------------+-----------------+
                       | Save Idea to Sheets (Ideas tab)   |
                       +-----------------+-----------------+
                                         |
              +--------------------------v--------------------------+
              | Gemini: Build cinematic Veo prompt (with character  |
              | memory, camera, lighting, audio cues, 4K, 9:16)     |
              +--------------------------+--------------------------+
                                         |
                       +-----------------v-----------------+
                       | Vertex AI Veo: Submit job (LRO)   |
                       +-----------------+-----------------+
                                         |
                       +-----------------v-----------------+
                       | Wait 30s -> Poll -> Veo Done?     |  <-- loop
                       +-----------------+-----------------+
                                         |
                       +-----------------v-----------------+
                       | Download MP4 from GCS             |
                       +-----------------+-----------------+
                                         |
                       +-----------------v-----------------+
                       | Gemini: Title / Desc / Caption /  |
                       | 12-15 hashtags (family-friendly)  |
                       +-----------------+-----------------+
                                         |
                       +-----------------v-----------------+
                       | Upload to Google Drive            |
                       +-----------------+-----------------+
                                         |
                          +--------------+--------------+
                          |                             |
                          v                             v
              +-----------+----------+      +-----------+----------+
              | YouTube: schedule    |      | Facebook: 3-step     |
              | Short (privacy=priv  |      | Reel upload + finish |
              | -> publishAt now+15) |      | (SCHEDULED)          |
              +-----------+----------+      +-----------+----------+
                          |                             |
                          +--------------+--------------+
                                         |
                       +-----------------v-----------------+
                       | Aggregate results -> Save Video   |
                       | row + INFO log line (Sheets)      |
                       +-----------------------------------+

   On any failure (per-node retries exhausted) -> Collect Error
                                  -> Trigger Error Handler workflow
                                  -> Logs row + RetryCounter increment
                                  -> Slack/Discord webhook + Email
```

---

## Quick start (TL;DR)

```bash
# On a fresh Ubuntu 22.04 VPS:
sudo bash scripts/bootstrap-vps.sh

# Then:
cp .env.example .env
nano .env                                  # fill all values
mkdir -p secrets && cp /path/to/sa.json secrets/service-account.json
docker compose --profile production up -d

# Open n8n at https://YOUR_DOMAIN
# Import workflows/02-error-handler.json   -> copy its id into ERROR_HANDLER_WORKFLOW_ID
# Import workflows/01-main-ai-video-pipeline.json
# Import workflows/03-dashboard.json       -> activate (serves the dashboard)
docker compose up -d                       # reload env

# In each workflow, attach the Google Service Account + YouTube OAuth2 credentials.
# Click Execute Workflow once for a smoke test. Then toggle the main workflow Active.
```

Detailed steps live in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## How each requirement is satisfied

| Spec requirement | Where in the system |
|---|---|
| 1. Configurable schedule (8/13/19) | `Schedule Trigger` reads `$env.CRON_SCHEDULE` |
| 2. Idea Generation Agent (Gemini, 8 niches, dedup, store in Sheets) | `Gemini: Generate Idea` + `Parse + Dedup Check` + `Save Idea to Sheets` |
| 3. Prompt Generation Agent (cinematic Veo prompt with all 8 elements) | `Gemini: Build Veo Prompt` + `Parse Veo Prompt` |
| 4. Consistent character memory (Leo, Mom, Dad, Max) | `Load Character Memory` Code node, injected into every prompt |
| 5. Video generation (Veo submit, poll, download) | `Vertex AI Veo: Submit Job` -> Wait/Poll loop -> `Download Video from GCS` |
| 6. Metadata (title, desc, FB caption, hashtags, family-friendly, no clickbait) | `Gemini: Generate Metadata` + `Parse Metadata` |
| 7. Storage (Drive + Sheets record of all metadata + URLs + status) | `Upload to Google Drive` + `Save Video Record` |
| 8. YouTube Short upload with schedule + URL save | `YouTube: Upload Short` (privacyStatus=private + publishAt) -> `Aggregate Upload Results` |
| 9. Facebook Reel upload with schedule + URL save | 3-step Graph API upload + `Aggregate Upload Results` |
| 10. Logging (success / fail / API errors / retries) | `Logs` Sheet tab written by main + error workflows |
| 11. Error handling (retries, repeated-failure notification) | per-node retries + `02-error-handler.json` + Slack/Email |
| 12. Dashboard (generated, published, upcoming, failed, views) | `03-dashboard.json` HTML webhook |
| 13. Secure config via env vars | Everything sensitive lives in `.env`, mounted via docker-compose |

---

## Required integrations

- **Gemini API** - text generation (idea, prompt, metadata)
- **Google Vertex AI Veo** - video generation
- **Google Cloud Storage** - Veo's output bucket
- **Google Drive API** - permanent video archive
- **Google Sheets API** - state store + dashboard datasource
- **YouTube Data API v3** - Shorts upload
- **Facebook Graph API** - Reels upload

All authenticate either through one shared **service account** (Google) or per-platform OAuth/token credentials. See `docs/NODE_CONFIGURATION.md` for the exact wiring.

---

## Operating it day-to-day

- **Change the cron schedule:** edit `CRON_SCHEDULE` in `.env`, `docker compose up -d`. No workflow edit needed.
- **Adjust character canon:** edit the `characters` object in `Load Character Memory` and save the workflow.
- **Open the dashboard:** `https://YOUR_DOMAIN/webhook/ai-video-dashboard` (auto-refreshes every 60s).
- **Watch logs:** `docker compose logs -f n8n` on the host, or filter the Sheet `Logs` tab by `level=ERROR`.
- **Pause everything:** toggle the main workflow Inactive in the n8n UI - it stops cleanly between runs without losing state.

---

## Costs (rough monthly)

| Item | Order of magnitude |
|---|---|
| VPS (Hetzner CPX21 / DO 4GB) | $7-15 |
| Domain | $1-2 |
| Vertex AI Veo (3 vids/day x ~8s) | $$ - dominant cost; check current Google pricing |
| Gemini Flash text calls | cents |
| GCS storage (transient) | cents |
| YouTube + Facebook + Drive APIs | free |

Veo billing is per-second of generated video and dwarfs everything else. Tune `durationSeconds` in the Veo prompt JSON to control spend.

---

## Limitations / honest caveats

- The Veo model id evolves. `veo-3.0-generate-preview` is set as the default; bump `VEO_MODEL_ID` when Google publishes a new GA version.
- Veo's Long-Running Operation request shape (`predictLongRunning` / `fetchPredictOperation`) reflects the public Vertex pattern at the time of writing; if Google ships a `:generateVideo` shortcut, the two HTTP nodes can be replaced with simpler equivalents.
- "Total Views" on the dashboard is a placeholder until you wire the YouTube Analytics + Facebook Insights APIs - see `docs/ERROR_HANDLING.md` future-integration note.
- Facebook long-lived Page tokens still expire roughly every 60 days. Add a calendar reminder, or build a small refresh workflow.

---

## License + attribution

Internal project. Use freely within the Toyandra/toya repo. Mention upstream tools (n8n, Google Vertex AI, Gemini, Meta Graph API) when republishing.
