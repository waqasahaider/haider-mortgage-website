#!/usr/bin/env bash
# ============================================================
# Near-zero-downtime deploy for the Haider Mortgage website.
# Run on the VPS from the repo root (/docker/haider-site):
#     ./deploy.sh
#
# Static content is bind-mounted, so a content-only change is live
# the instant `git pull` updates the files. The container is only
# recreated when compose / nginx config changes.
# ============================================================
set -euo pipefail

cd "$(dirname "$0")"
echo "▶ Deploying from $(pwd)"

BRANCH="${DEPLOY_BRANCH:-main}"
echo "▶ Fetching origin/${BRANCH}..."
git fetch --all --prune
git reset --hard "origin/${BRANCH}"

echo "▶ Applying stack..."
docker compose up -d --remove-orphans

echo "✅ Deploy complete."
docker compose ps
