# Demo script

1. Start `docker compose up --build`.
2. `curl http://localhost:8000/health`.
3. `python cli.py submit --name demo-storefront --change "Add VIP pricing"`.
4. Run the worker or inspect its event stream with `GET /api/runs/{id}/events`.
5. Verify duplicate submission with the same idempotency key returns the same run.

6. Start the storefront API and UI, then compare `regular-demo` and `vip-demo` pricing.
7. Create an order with `SAVE10` as VIP and verify the VIP unit price is used once, not stacked with the promo.
8. Create a national-shipping order, fetch it again, cancel it, and verify the stored total and price snapshot do not change.
