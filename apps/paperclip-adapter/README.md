# Paperclip adapter boundary

The adapter accepts Paperclip wake-ups at `POST /adapter/wake`, forwards them to the Core API with a service token, and suppresses duplicate idempotency keys. Paperclip company/project/role mapping is intentionally configured outside source code so credentials and model selection are not hardcoded.
