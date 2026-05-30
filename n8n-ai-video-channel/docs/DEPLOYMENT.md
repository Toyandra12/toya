# Deployment Instructions

This document covers deploying the AI Video Channel pipeline from zero to a 24/7 autonomous setup.

---

## Prerequisites

- A GCP project with billing enabled and the following APIs ON:
  - Vertex AI API (`aiplatform.googleapis.com`)
  - Generative Language API (`generativelanguage.googleapis.com`)
  - Cloud Storage (`storage.googleapis.com`)
  - Google Drive API (`drive.googleapis.com`)
  - Google Sheets API (`sheets.googleapis.com`)
  - YouTube Data API v3 (`youtube.googleapis.com`)
- A YouTube channel you own.
- A Facebook Page (creator/business) with a long-lived Page access token.
- A Linux server (any VPS, see `VPS_HOSTING.md` for sizing) with Docker + Docker Compose installed.
- A domain pointing to the server (recommended for HTTPS via Caddy).

---

## Step 1: Prepare cloud resources

```bash
# In gcloud CLI
gcloud config set project YOUR_PROJECT_ID

# Service account
gcloud iam service-accounts create n8n-ai-video \
  --display-name="n8n AI Video Channel"

SA_EMAIL=n8n-ai-video@YOUR_PROJECT_ID.iam.gserviceaccount.com

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" --role="roles/aiplatform.user"

# GCS bucket for Veo output
gcloud storage buckets create gs://YOUR_VEO_BUCKET --location=us-central1
gcloud storage buckets add-iam-policy-binding gs://YOUR_VEO_BUCKET \
  --member="serviceAccount:$SA_EMAIL" --role="roles/storage.objectAdmin"

# Generate the JSON key
gcloud iam service-accounts keys create ./service-account.json \
  --iam-account=$SA_EMAIL
```

Then in the browser:
- Create a new Google Spreadsheet, run the Apps Script in `sheets/google-sheets-template.md`, share the sheet with `$SA_EMAIL` as Editor, copy its document ID.
- Create a Drive folder for videos, share it with `$SA_EMAIL` as Editor, copy the folder ID.

---

## Step 2: Provision the server

On a fresh Ubuntu 22.04 LTS VPS:

```bash
# As root
apt update && apt -y upgrade
apt -y install curl git ufw

# Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Clone this repo onto the server
cd /opt
git clone https://github.com/Toyandra12/toya.git
cd toya/n8n-ai-video-channel
```

---

## Step 3: Configure environment

```bash
cp .env.example .env
nano .env   # fill in every value

# Place the service-account JSON where docker-compose mounts it
mkdir -p secrets
cp /path/to/service-account.json secrets/service-account.json
chmod 600 secrets/service-account.json

# Generate a strong encryption key (paste into N8N_ENCRYPTION_KEY)
openssl rand -hex 32
```

> **Critical:** `N8N_ENCRYPTION_KEY` must NEVER change after the first start, otherwise stored credentials become unreadable.

---

## Step 4: Boot the stack

For local / single-host without HTTPS:

```bash
docker compose up -d
docker compose logs -f n8n
```

For production with the bundled Caddy reverse proxy + Let's Encrypt:

```bash
# Make sure your A record points to this server, then:
N8N_HOST=n8n.yourdomain.com docker compose --profile production up -d
```

n8n will be available at `https://n8n.yourdomain.com`.

---

## Step 5: Import workflows

In the n8n UI:

1. Go to **Workflows -> Import from File** and import these in order:
   1. `workflows/02-error-handler.json` -> Save -> copy its workflow ID into `.env` as `ERROR_HANDLER_WORKFLOW_ID`.
   2. `workflows/01-main-ai-video-pipeline.json` -> Save.
   3. `workflows/03-dashboard.json` -> Save -> activate (it serves the webhook).
2. `docker compose up -d` again to reload env so the main workflow picks up `ERROR_HANDLER_WORKFLOW_ID`.

---

## Step 6: Wire credentials

Inside each workflow:
- Click any Google Sheets / Drive / Vertex node and select the `Google Service Account` credential you created.
- Click the YouTube node and connect with OAuth as the channel owner.
- Click the email node in the error handler and select the `SMTP` credential.

---

## Step 7: Manual smoke test

1. Open `01-main-ai-video-pipeline.json` in the editor.
2. Disable the Schedule Trigger.
3. Click **Execute Workflow**.
4. Watch each node turn green.
5. Verify a row was added to `Videos` and the YouTube/Facebook scheduled posts exist.

---

## Step 8: Activate

- Re-enable the Schedule Trigger node.
- Toggle the workflow to **Active** at the top right.
- The pipeline now runs at the cron times you configured, even if you log out / close your browser.

---

## Step 9: Open the dashboard

Once the dashboard workflow is active, browse to:

```
https://n8n.yourdomain.com/webhook/ai-video-dashboard
```

You will get an auto-refreshing HTML page with all current stats.

---

## Step 10: Backups

```bash
# n8n data + Postgres
docker compose exec postgres pg_dump -U n8n n8n > backup_$(date +%F).sql
tar czf n8n_data_$(date +%F).tgz $(docker volume inspect -f '{{ .Mountpoint }}' n8n-ai-video-channel_n8n_data)
```

Schedule the above with cron on the host.

---

## Updating

```bash
cd /opt/toya/n8n-ai-video-channel
git pull
docker compose pull
docker compose up -d
```
