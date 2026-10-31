# Demo script

1. Start `docker compose up --build`.
2. `curl http://localhost:8000/health`.
3. `python cli.py submit --name demo-storefront --change "Add VIP pricing"`.
4. Run the worker or inspect its event stream with `GET /api/runs/{id}/events`.
5. Verify duplicate submission with the same idempotency key returns the same run.

The VIP → shipping fee → cancellation business demo is not yet implemented; it is tracked as the next product slice.
