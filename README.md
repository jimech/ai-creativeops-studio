# ai-creativeops-studio

AI-powered creative operations for high-touch brands — campaign concepts, captions, hooks, and visual direction.

## Production deployment

### 1. Apply database migrations

Run migrations against the production database **before** or as part of the first deploy:

```bash
npx prisma migrate deploy
```

The app expects the schema in `prisma/migrations/` to match the deployed database.

### 2. Required production environment variables

Set these in your hosting provider (e.g. Vercel). Copy `.env.example` as a checklist — never commit real secrets.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon Postgres connection string |
| `AUTH_SECRET` | Auth.js session encryption secret |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `AUTH_URL` | Public app URL (e.g. `https://your-domain.com`) — must match the production domain |
| `OPENAI_API_KEY` | OpenAI API key for campaign generation |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret for the production endpoint |
| `STRIPE_PRO_PRICE_ID` | Stripe Price ID for the Pro plan |
| `STRIPE_AGENCY_PRICE_ID` | Stripe Price ID for the Agency plan |
| `NEXT_PUBLIC_APP_URL` | Public app URL used for Stripe checkout redirects |

**Auth:** Set `AUTH_URL` to your production domain so Google OAuth redirects work correctly.

**AI:** Do **not** set `AI_GENERATION_MODE=mock` in production. Mock mode is only allowed when `NODE_ENV` is not `production`.

**Stripe:** Use **test** keys while validating checkout in staging. Switch to **live** Stripe keys and live Price IDs only when you are ready to accept real payments. Register the production webhook endpoint in the Stripe Dashboard:

```
https://your-domain.com/api/stripe/webhook
```

Subscribe to at least: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

### 3. Prisma client generation

`postinstall` runs `prisma generate` automatically after `npm install`, so the Prisma client is available during production builds. You can also run manually:

```bash
npm run db:generate
```

### 4. Build and start

```bash
npm run build
npm run start
```

### 5. Local development

Copy `.env.example` to `.env` and fill in values. For local testing without OpenAI credits, you may set `AI_GENERATION_MODE=mock` (non-production only).

```bash
npm install
npm run dev
```
