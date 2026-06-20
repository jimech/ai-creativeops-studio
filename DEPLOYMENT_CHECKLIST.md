# Deployment Checklist (Ticket 40)

Use this checklist to prepare first Vercel production deployment. This document is intentionally operational and does not change app runtime behavior.

## 1) Vercel Project Setup

- Create/select the Vercel project connected to this repository.
- Confirm production branch is set to `main`.
- Confirm install/build commands:
  - Install: `npm install`
  - Build: `npm run build`
- Note: `postinstall` runs `prisma generate` automatically after install.

## 2) Production Environment Variables

Set all required variables in Vercel production environment before first deploy:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_URL`
- `OPENAI_API_KEY`
- `AI_GENERATION_MODE`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_AGENCY_PRICE_ID`
- `NEXT_PUBLIC_APP_URL`

Rules:

- Use production-safe values only.
- Never commit real secrets.
- `AI_GENERATION_MODE` must not be `mock` in production.
- `AUTH_URL` and `NEXT_PUBLIC_APP_URL` must match deployed domain.

## 3) Neon Production Database Setup

- Provision production Neon database.
- Configure pooled/SSL production `DATABASE_URL` in Vercel.
- Verify app connects successfully in production environment.

## 4) Prisma Migration Deploy

Before or during first production rollout, apply existing migrations:

```bash
npm run db:migrate:deploy
```

Notes:

- This command runs `prisma migrate deploy` and applies checked-in migrations only.
- Do not create schema changes or new migrations as part of deployment prep.

## 5) Google OAuth Production Redirect URLs

In Google Cloud OAuth client settings, add production URLs:

- Authorized JavaScript origins: `https://<your-domain>`
- Authorized redirect URI:
  - `https://<your-domain>/api/auth/callback/google`

Ensure these align with `AUTH_URL`.

## 6) Stripe Mode Decision Checklist (Test vs Live)

Before go-live, explicitly choose one mode:

- Test mode for dry runs and QA
- Live mode for real billing

For selected mode, verify:

- `STRIPE_SECRET_KEY` matches mode.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` matches mode.
- `STRIPE_PRO_PRICE_ID` and `STRIPE_AGENCY_PRICE_ID` come from same mode.

## 7) Stripe Webhook Endpoint Setup

Create webhook endpoint in Stripe Dashboard:

- URL: `https://<your-domain>/api/stripe/webhook`
- Events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

Copy the resulting signing secret into `STRIPE_WEBHOOK_SECRET` for the matching mode.

## 8) OpenAI Key and AI Mode

- Set `OPENAI_API_KEY` to a valid production key.
- Verify `AI_GENERATION_MODE` is unset or non-mock for production.

## 9) Post-Deploy Smoke Tests

After first deploy, verify:

- Home page loads and sign-in works.
- Dashboard routes require auth.
- Billing page loads for authenticated user.
- Stripe checkout can create a session.
- Stripe portal can open for a user with `stripeCustomerId`.
- Webhook endpoint returns 2xx for valid test event delivery.
- AI campaign generation succeeds with real OpenAI key (non-mock mode).

## 10) Deployment Blockers to Re-check

- Vercel install must run `postinstall` (`prisma generate`).
- Production database must have migrations applied.
- Webhook secret must be from the exact configured endpoint and mode.
- `AUTH_URL` and `NEXT_PUBLIC_APP_URL` must match deployed domain exactly.
