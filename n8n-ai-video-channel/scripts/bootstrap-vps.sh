#!/usr/bin/env bash
# =============================================================================
# Bootstrap a fresh Ubuntu 22.04 VPS for the AI Video Channel n8n stack.
# Run once as root: sudo bash scripts/bootstrap-vps.sh
# =============================================================================
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Please run as root (sudo)." >&2
  exit 1
fi

echo "==> Updating system"
apt update
DEBIAN_FRONTEND=noninteractive apt -y upgrade

echo "==> Installing base packages"
apt -y install curl git ufw fail2ban unattended-upgrades ca-certificates gnupg

echo "==> Configuring firewall"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> Enabling fail2ban + unattended upgrades"
systemctl enable --now fail2ban
echo 'Unattended-Upgrade::Automatic-Reboot "false";' > /etc/apt/apt.conf.d/52unattended-reboot
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "==> Installing Docker engine"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

echo "==> Creating swap (helps small VPS survive brief memory pressure)"
if [[ ! -f /swapfile ]]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Tightening sysctl for n8n long-lived connections"
cat >/etc/sysctl.d/99-n8n.conf <<EOF
net.core.somaxconn=4096
net.ipv4.tcp_keepalive_time=120
net.ipv4.tcp_keepalive_intvl=30
net.ipv4.tcp_keepalive_probes=8
EOF
sysctl --system >/dev/null

echo "==> Done."
echo "Next steps:"
echo "  1) Clone the repo into /opt and cd into n8n-ai-video-channel"
echo "  2) cp .env.example .env && edit"
echo "  3) Place your service-account JSON at ./secrets/service-account.json"
echo "  4) docker compose --profile production up -d"
