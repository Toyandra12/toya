# =============================================================================
# Optional custom n8n image
# Adds ffmpeg + curl + tini for video post-processing and healthchecks.
# Use only if you need extra system tooling beyond the stock n8n image.
# =============================================================================
FROM n8nio/n8n:latest

USER root

RUN apk add --no-cache \
      ffmpeg \
      curl \
      tini \
      ca-certificates \
      tzdata

# Drop back to the unprivileged node user that n8n ships with
USER node

# Healthcheck against the editor UI
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -fsS http://localhost:5678/healthz || exit 1

ENTRYPOINT ["/sbin/tini", "--", "tini-entrypoint.sh"]
