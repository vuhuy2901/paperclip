FROM node:24.11-bookworm
WORKDIR /opt/paperclip
RUN npm install -g paperclipai@2026.1023.0
COPY apps/paperclip-adapter /opt/ai-company-adapter
RUN cd /opt/ai-company-adapter && npm install && npm run build
COPY infra/paperclip/configure.mjs infra/paperclip/entrypoint.sh ./
RUN chmod +x entrypoint.sh && mkdir -p /home/node/.paperclip && chown -R node:node /opt/paperclip /home/node/.paperclip
USER node
ENTRYPOINT ["/opt/paperclip/entrypoint.sh"]
