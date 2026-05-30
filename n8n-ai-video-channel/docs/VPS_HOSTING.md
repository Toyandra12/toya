# VPS Hosting Guide

The pipeline must keep running while you sleep. A small always-on Linux VPS is the simplest way.

---

## Sizing

| Resource | Minimum | Recommended | Why |
|----------|---------|-------------|-----|
| vCPU | 2 | 4 | Veo polling + Google Drive uploads are I/O bound; bursts during metadata generation. |
| RAM | 2 GB | 4-8 GB | n8n + Postgres + occasional 100-300 MB MP4 in memory during upload. |
| Disk | 20 GB SSD | 40-80 GB SSD | Postgres growth + execution data + image layers. |
| Network | 1 Gbps shared | 1 Gbps shared | Each video can be 50-150 MB; 3 runs/day is small. |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS | Best Docker support and longest support window. |

Three videos a day = roughly 15-50 GB egress per month, well within any provider's free allowance.

---

## Provider quick comparison

Pick whichever you trust. All work fine.

| Provider | Plan that fits | Pros | Notes |
|----------|----------------|------|-------|
| Hetzner Cloud | CPX21 (3 vCPU / 4 GB) | Cheapest in EU, snapshots cheap | EU/US datacenters |
| DigitalOcean | Basic Premium 2vCPU/4GB | Easiest UI, 1-click Docker droplet | Has Marketplace n8n image (skip if you want full control) |
| Vultr | High Frequency 2vCPU/4GB | Fast NVMe, many regions | Solid all-rounder |
| Linode | Shared 4 GB | Dependable, good docs | Now Akamai |
| OVH / Contabo | VPS SSD 2-4 vCPU | Cheap if you tolerate variable latency | Good for budget |
| AWS Lightsail | $20/mo plan | Easiest if you already use AWS | Higher cost than the above |

---

## One-shot bootstrap script

After your first SSH into a fresh Ubuntu 22.04 box, run:

```bash
sudo bash <<'EOF'
set -e
apt update && apt -y upgrade
apt -y install curl git ufw fail2ban unattended-upgrades

# Hardening
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
systemctl enable --now fail2ban
dpkg-reconfigure -plow unattended-upgrades

# Docker
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

# Swap (helps small RAM boxes survive OOM)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

echo "Server ready. Reboot recommended."
EOF
```

`scripts/bootstrap-vps.sh` in this repo automates the same thing.

---

## DNS

Create an A record:

```
n8n.yourdomain.com  ->  YOUR_VPS_IP
```

Wait for propagation (`dig n8n.yourdomain.com`) before booting Caddy, otherwise the cert request fails.

---

## Keep-alive

n8n inside Docker is already restart-on-failure (`restart: unless-stopped`) and Docker auto-starts on boot. To verify:

```bash
sudo systemctl is-enabled docker          # -> enabled
sudo docker compose ps                     # all should show "Up"
sudo systemctl reboot                      # then re-check after boot
```

---

## Monitoring

Two cheap options:

1. **Healthcheck.io** - add a tiny Cron node in n8n that pings `https://hc-ping.com/<uuid>` every 10 minutes. If it stops, you get an email.
2. **Uptime Kuma** - run as another container on the same box, point it at `https://n8n.yourdomain.com/healthz` and at the dashboard webhook URL.

---

## Cost reality check

A Hetzner CPX21 + a `.com` domain + transactional-email plan (Postmark / SES) lands around **USD 7-12 per month** all-in. Veo is the dominant cost and is billed per-second of generated video by Google directly, **not** by the VPS.

---

## Disaster recovery

The only state you cannot regenerate is:
- The Postgres DB (`postgres_data` volume).
- The n8n encryption key (`N8N_ENCRYPTION_KEY` env var).

Back both up. With those two you can rebuild on any new server in 10 minutes.
