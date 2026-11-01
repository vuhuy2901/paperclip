#!/bin/sh
set -eu

CONFIG=/home/node/.paperclip/instances/default/config.json
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

exec paperclipai run
