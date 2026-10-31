# Paperclip adapter boundary

The package exports Paperclip-compatible metadata and `createServerAdapter()` with `execute()` and `testEnvironment()` from `src/index.ts`. The local bridge server accepts Paperclip wake-ups at `POST /adapter/wake`, forwards them to the Core API with a service token, and suppresses duplicate idempotency keys. Company/project/role mapping is configured outside source code.
