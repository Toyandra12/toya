# Error Handling Documentation

The pipeline is designed for **24/7 unattended operation**. Errors are normal at this scale - the system absorbs them, logs them, retries, and only escalates after repeated failure.

---

## Layered defense

### Layer 1: Per-node retries (cheap)

Every external API call (Gemini, Vertex AI, Drive, YouTube, Facebook) has:

```
retryOnFail: true
maxTries: 3
waitBetweenTries: 5-15 seconds (exponential-ish)
```

Most transient failures (rate limits, 5xx, network blips) are absorbed here without any branching.

### Layer 2: Error output routing (per stage)

Critical nodes have `onError: continueErrorOutput`. When their retries are exhausted they emit on output index 1, which feeds into the **Collect Error** node and then **Trigger Error Handler**.

This means the main pipeline never throws an unhandled exception - it always lands in the error handler with structured context.

### Layer 3: Error handler sub-workflow (`02-error-handler.json`)

Triggered two ways:
- **Error Trigger** node fires automatically for **any** unhandled exception in **any** workflow that has this one set as its error workflow.
- **executeWorkflow Trigger** is invoked explicitly from the main pipeline's Collect Error path.

It performs:

1. **Normalize** the payload (run id, stage, message, stack).
2. **Log** an `ERROR` row to the `Logs` Sheet tab.
3. **Read / upsert** the `RetryCounter` row for this `run_id` and increment `attempts`.
4. **Compare** to `MAX_RETRY_ATTEMPTS` (default 3).
5. **Notify** via Slack/Discord webhook + Email when the threshold is hit.

### Layer 4: Notifications

Two parallel channels so a single outage of one provider does not silence you:

- HTTP webhook (`NOTIFY_WEBHOOK_URL`) - works for Slack, Discord (use a webhook URL), Microsoft Teams, or any custom endpoint.
- SMTP email (`NOTIFY_TO_EMAIL`) - via the n8n Email Send node.

Both are `onError: continueRegularOutput` so a notification failure cannot block the rest of the handler.

---

## What gets logged

Every row in the `Logs` Sheet tab has:

| Column | Example |
|--------|---------|
| timestamp | `2026-05-30T08:00:42.118Z` |
| run_id | `run_1748594442118_a1b2c3` |
| level | `INFO` / `WARN` / `ERROR` |
| stage | `idea_generation`, `veo_submit`, `youtube_upload`, etc. |
| message | Short human-readable summary |
| details | JSON with stack/context, truncated to 1500 chars |

Successful runs also write a single `INFO` row at the end with all three URLs (YouTube, Facebook, Drive).

---

## Failure scenarios and what the system does

| Scenario | Behavior |
|----------|----------|
| Gemini 429 / 503 | Auto-retried 3x. If still failing -> error handler logs, increments counter. |
| Veo job rejected (policy) | `Evaluate Poll` throws -> error handler logs the exact policy reason. **No retry** because it would fail again. |
| Veo polling exceeds `VEO_MAX_POLL_ATTEMPTS` | Throws "polling timed out" -> error handler logs. Operation is left running on Google side; you can re-fetch by run id later. |
| GCS download blocked (auth) | Retried 3x, then error handler. Usually means service-account key rotation. |
| Drive quota | Retried; n8n's google-drive node respects quota errors with back-off. |
| YouTube upload fails but Facebook succeeds | Aggregator records `final_status: published` (because at least one platform shipped). YT row marked `failed`. Counter is **not** incremented because the run partially succeeded. |
| Both platforms fail | `final_status: partial_failure` and the failed branches each invoke error handler. |
| Duplicate idea detected | `Parse + Dedup Check` throws -> handler logs, no notification (this is expected periodically). The next scheduled run will try again with a fresh idea. |
| n8n process killed | systemd / docker `restart: unless-stopped` brings it back. Postgres-backed execution state means in-flight runs are not lost; they resume on next boot. |

---

## Tuning

- Increase `MAX_RETRY_ATTEMPTS` for noisier APIs.
- Increase `VEO_MAX_POLL_ATTEMPTS` if Veo is queueing during peak hours.
- Lower per-node `maxTries` if you want faster failure detection at the cost of less resilience.
- Disable email notifications by leaving `NOTIFY_TO_EMAIL` blank (the email node will continue-on-error).

---

## Reading the dashboard for ops

`/webhook/ai-video-dashboard` shows:

- **Errors (24h)** card - your single most useful health metric. Should normally be 0-2.
- **Recent Errors** table - the last 10 ERROR rows, with stage column to spot patterns (e.g. all failures are `veo_submit` -> probably a Veo regional outage).
- **Failed** card - lifetime count.

If **Failed** climbs faster than **Published** for two consecutive days, treat that as a P1: you are publishing less than half of attempts. Inspect the `Logs` tab grouped by `stage`.

---

## Manual recovery cheatsheet

```bash
# Re-run a specific failed execution from n8n UI:
#   Executions -> filter Failed -> click -> "Retry from failed step"

# Inspect the most recent error
docker compose logs --tail 200 n8n | grep -i error

# If the encryption key is somehow changed and creds are unreadable:
#   restore from backup (.env + postgres dump). Never edit N8N_ENCRYPTION_KEY in place.
```
