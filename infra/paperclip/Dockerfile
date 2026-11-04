FROM node:24.11-bookworm
WORKDIR /opt/paperclip
RUN npm install -g paperclipai@2026.1023.0
# The Paperclip CLI package ships the upstream UI. Replace only its static UI
# directory with the UI built from the pinned Core fork, so /issues actually
# serves the customized IssuesList instead of the npm package's old bundle.
COPY vendor/paperclip-core/ui/dist /opt/paperclip-core-ui-dist
RUN rm -rf /usr/local/lib/node_modules/paperclipai/node_modules/@paperclipai/server/ui-dist \
  && cp -a /opt/paperclip-core-ui-dist /usr/local/lib/node_modules/paperclipai/node_modules/@paperclipai/server/ui-dist
COPY apps/paperclip-adapter /opt/ai-company-adapter
RUN cd /opt/ai-company-adapter && npm install && npm run build
COPY packages/paperclip-native-workflow/package-runtime.json /opt/ai-company-native-workflow/package.json
RUN cd /opt/ai-company-native-workflow && npm install --omit=dev --ignore-scripts --no-package-lock
COPY packages/paperclip-native-workflow/dist /opt/ai-company-native-workflow/dist
COPY apps/roles /opt/role-assets
COPY infra/paperclip/configure.mjs infra/paperclip/proxy.mjs infra/paperclip/sync-skills.mjs infra/paperclip/entrypoint.sh ./
RUN chmod +x entrypoint.sh && mkdir -p /home/node/.paperclip && chown -R node:node /opt/paperclip /home/node/.paperclip
USER node
ENTRYPOINT ["/opt/paperclip/entrypoint.sh"]
