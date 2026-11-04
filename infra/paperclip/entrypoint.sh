#!/bin/sh
set -eu

CONFIG=/home/node/.paperclip/instances/default/config.json
DB_PID_FILE=/home/node/.paperclip/instances/default/db/postmaster.pid
if [ -f "$DB_PID_FILE" ]; then
  DB_PID=$(sed -n '1p' "$DB_PID_FILE" 2>/dev/null || true)
  if [ -n "$DB_PID" ] && ! kill -0 "$DB_PID" 2>/dev/null; then
    rm -f "$DB_PID_FILE"
  fi
fi
if [ ! -f "$CONFIG" ]; then
  paperclipai onboard --yes >/tmp/paperclip-onboard.log 2>&1 &
  ONBOARD_PID=$!
  while [ ! -f "$CONFIG" ]; do sleep 1; done
  node /opt/paperclip/configure.mjs
  kill "$ONBOARD_PID" 2>/dev/null || true
  wait "$ONBOARD_PID" 2>/dev/null || true
else
  node /opt/paperclip/configure.mjs
fi

if [ "${PAPERCLIP_DEPLOYMENT_MODE:-}" = "local_trusted" ]; then
  node /opt/paperclip/proxy.mjs &
fi

paperclipai run &
PAPERCLIP_PID=$!

# Install the template-only workflow plugin into this local Paperclip instance.
# This is deliberately an install/load step only: the plugin has no scheduler,
# workflow runner, heartbeat loop, or custom execution gate.
(
  for attempt in $(seq 1 30); do
    if curl -fsS http://127.0.0.1:3101/api/health >/dev/null 2>&1; then break; fi
    sleep 1
  done
  plugin_info=$(curl -fsS http://127.0.0.1:3101/api/plugins/ai-company-native-workflow 2>/dev/null || true)
  if ! printf '%s' "$plugin_info" | grep -Eq '"status":"(ready|running|enabled)"'; then
    curl -fsS -X POST http://127.0.0.1:3101/api/plugins/install \
      -H 'content-type: application/json' \
      -d '{"packageName":"/opt/ai-company-native-workflow","isLocalPath":true}' >/tmp/native-workflow-plugin-install.log 2>&1 || echo "Native workflow plugin install deferred; retry on next restart"
  fi
) &
node /opt/paperclip/sync-skills.mjs || echo "Paperclip role-skill sync did not complete; retry on next restart"
wait "$PAPERCLIP_PID"
