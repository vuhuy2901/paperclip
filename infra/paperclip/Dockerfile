FROM node:24.11-bookworm
WORKDIR /opt/paperclip
RUN npm install -g paperclipai@2026.1023.0
COPY apps/paperclip-adapter /opt/ai-company-adapter
RUN cd /opt/ai-company-adapter && npm install && npm run build
COPY packages/paperclip-workflow-studio/package.json packages/paperclip-workflow-studio/package-lock.json packages/paperclip-workflow-studio/tsconfig.json /opt/workflow-studio/
COPY packages/paperclip-workflow-studio/scripts /opt/workflow-studio/scripts
COPY packages/paperclip-workflow-studio/src /opt/workflow-studio/src
RUN cd /opt/workflow-studio && npm ci && npm run build
COPY apps/roles /opt/role-assets
COPY infra/paperclip/configure.mjs infra/paperclip/proxy.mjs infra/paperclip/sync-skills.mjs infra/paperclip/install-workflow-plugin.mjs infra/paperclip/entrypoint.sh ./
RUN chmod +x entrypoint.sh && mkdir -p /home/node/.paperclip && chown -R node:node /opt/paperclip /opt/workflow-studio /home/node/.paperclip
USER node
ENTRYPOINT ["/opt/paperclip/entrypoint.sh"]
