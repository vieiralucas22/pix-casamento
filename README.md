This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Mercado Pago setup (Pix payments)

This site creates a real Pix charge through [Mercado Pago](https://www.mercadopago.com.br/developers) when a guest clicks "Continuar com Pix". Before that works locally or in production you need to configure a Mercado Pago application.

### 1. Create an application and get an access token

- Sign up at https://www.mercadopago.com.br/developers/panel and create an application.
- Under **Credenciais**, you'll find both a **Test** access token (sandbox-like — no real money moves) and a **Production** access token. Unlike some providers, Mercado Pago uses the same API host (`api.mercadopago.com`) for both — which token you use decides test vs. real money, not the URL.
- Start with the Test token for `MERCADOPAGO_ACCESS_TOKEN`.

### 2. Set the shared payer identity

Every Pix payment requires a `payer.email` and a CPF (`payer.identification`). Since guests are anonymous, this project uses one shared payer identity (your own) for every gift, instead of collecting each guest's personal documents:

- `MERCADOPAGO_PAYER_EMAIL` — any email you control.
- `MERCADOPAGO_PAYER_CPF` — your own CPF (digits only).

### 3. Register the webhook

- In the dashboard, open your application > **Webhooks > Configurar notificações**.
- URL: `https://<your-deployed-domain>/api/webhooks/mercadopago` (webhooks can't reach `localhost` — test this once deployed, or via Mercado Pago's webhook simulator in the dashboard).
- Events: enable **Order (Mercado Pago)** — this project uses the Orders API (`/v1/orders`), not the legacy Payments API, so that's the event topic that matters here. (Newer Mercado Pago access tokens only work against `/v1/orders`; `/v1/payments` responds to them with `401 Unauthorized use of live credentials`.)
- Reveal the **Assinatura secreta** (secret signature) — this is `MERCADOPAGO_WEBHOOK_SECRET`. Mercado Pago uses it to sign the `x-signature` header on every webhook call, which `app/api/webhooks/mercadopago/route.ts` validates with HMAC-SHA256.

### 4. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the four values from the steps above:

```bash
cp .env.example .env.local 
```

| Variable | Where it comes from |
| --- | --- |
| `MERCADOPAGO_ACCESS_TOKEN` | Step 1 |
| `MERCADOPAGO_PAYER_EMAIL` | Step 2 (your own) |
| `MERCADOPAGO_PAYER_CPF` | Step 2 (your own) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Step 3 |

None of these are prefixed with `NEXT_PUBLIC_` — they're only ever read on the server (`lib/payments/mercadopago-client.ts`, the `app/api/*` route handlers), never bundled into client code.

### How the flow works

1. Guest picks an amount → frontend calls `POST /api/pix`.
2. The route handler re-validates the amount server-side (`lib/payments/validate-amount.ts`) — it never trusts the amount sent by the browser beyond checking it matches an allowed preset or exceeds the custom minimum.
3. It creates a Pix order via Mercado Pago's `/v1/orders` endpoint (with an `X-Idempotency-Key` to avoid double-charging on retry); the QR code and "copia e cola" payload come back inline in the same response, nested under `transactions.payments[0].payment_method`.
4. The payment screen polls `GET /api/pix/[id]/status` every 5s, which proxies Mercado Pago's live order status (`GET /v1/orders/{id}`) — Mercado Pago remains the single source of truth, so there's no local database to keep in sync. An order is paid once its top-level `status` is `processed`.
5. `POST /api/webhooks/mercadopago` validates the `x-signature` header (HMAC-SHA256 against `MERCADOPAGO_WEBHOOK_SECRET`) and logs confirmed events, deduplicating by the notification `id` (Mercado Pago can deliver the same event more than once).

This currently has no persistent store — the webhook dedupe cache and payment records all live in Mercado Pago itself or in-memory. That's fine at this scale, but if this grows past a single small wedding, consider adding a durable store (e.g. Vercel KV) before relying on the webhook for anything beyond logging.

## Deploy on Vercel

### 1. Push and import the project

- Push this repo to GitHub/GitLab/Bitbucket.
- Go to [vercel.com/new](https://vercel.com/new) and import it. Keep the default Next.js build settings — no extra config needed.

### 2. Add environment variables

In the Vercel project, go to **Settings > Environment Variables** and add the same four variables from your `.env.local`:

| Variable | Value to use |
| --- | --- |
| `MERCADOPAGO_ACCESS_TOKEN` | Start with your **Test** token; switch to the **Production** token only once you're ready for real guests to pay |
| `MERCADOPAGO_PAYER_EMAIL` | Same value as local |
| `MERCADOPAGO_PAYER_CPF` | Same value as local |
| `MERCADOPAGO_WEBHOOK_SECRET` | Leave this for step 4 — you don't have it yet |

Deploy. You now have a real `https://` domain (e.g. `https://your-project.vercel.app`), which the webhook step needs.

### 3. Point the webhook at your real domain

Back in the Mercado Pago dashboard (app > **Webhooks > Configurar notificações**):

- Make sure you're on the right tab — **Modo de teste** while using a Test access token, **Modo de produção** once you switch to the Production token. Each mode has its own URL and its own secret signature.
- Paste your real deploy URL: `https://your-project.vercel.app/api/webhooks/mercadopago` (the placeholder-style `<your-deployed-domain>` won't validate — it'll show "Revise a URL inserida" and block saving).
- Check **Order (Mercado Pago)** under events (same note as step 3 of the setup section above).
- Click **Salvar configurações**. Only after a valid URL is saved does Mercado Pago generate the secret — the **Assinatura secreta** field stays greyed out until then.
- Reveal the secret and copy it.

### 4. Finish the environment variables

Back in Vercel, set `MERCADOPAGO_WEBHOOK_SECRET` to the value you just copied, then redeploy (Vercel doesn't pick up env var changes until the next deploy — use **Deployments > ⋯ > Redeploy**).

### 5. Test before sharing

- Use the dashboard's **Simular notificação** button to confirm the webhook returns `200` and that the signature check passes (check your Vercel function logs for `"Mercado Pago webhook event"`).
- With the Test token still in place, do a full fake Pix charge through the site itself and confirm the QR code renders and the status polling works.
- Only then switch to the Production access token + the production webhook secret (step 3, **Modo de produção** tab) and do one real test gift with a small amount before sending the link to guests.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for general deployment details.
