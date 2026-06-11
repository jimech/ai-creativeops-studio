# Technical Architecture: Maison Muse

## Overview

Maison Muse is planned as a full-stack SaaS application for AI-assisted campaign generation. The system will combine a Next.js web application, a protected API layer, PostgreSQL persistence, object storage for brand files, Stripe billing, and an AI provider for campaign and content generation.

## Frontend

Planned frontend stack:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

The frontend will provide:

- Public landing page
- Authentication screens
- Authenticated dashboard layout
- Brand onboarding flow
- Brand kit and asset upload UI
- Campaign generator UI
- Saved campaigns library
- Billing and settings pages

## Backend

Planned backend stack:

- Next.js API routes
- Server actions
- Prisma ORM

The backend will be responsible for:

- Validating authenticated requests
- Enforcing authorization rules
- Reading and writing application data through Prisma
- Handling AI generation requests
- Processing file upload metadata
- Managing Stripe checkout, customer portal, and webhook events
- Tracking AI usage by user and subscription plan

## Database

Planned database:

- PostgreSQL
- pgvector for future RAG search and brand document retrieval

Initial models:

### User

- `id`
- `email`
- `name`
- `role`
- `stripeCustomerId`
- `createdAt`

### Brand

- `id`
- `ownerId`
- `name`
- `industry`
- `toneOfVoice`
- `colors`
- `fonts`
- `targetAudience`
- `createdAt`

### Campaign

- `id`
- `brandId`
- `title`
- `goal`
- `platform`
- `status`
- `aiOutput`
- `createdAt`

### Asset

- `id`
- `brandId`
- `fileName`
- `fileUrl`
- `fileType`
- `uploadedBy`
- `createdAt`

### Subscription

- `id`
- `userId`
- `stripeSubscriptionId`
- `plan`
- `status`
- `currentPeriodEnd`

### AiUsage

- `id`
- `userId`
- `actionType`
- `tokensUsed`
- `createdAt`

## Authentication and Authorization

Planned authentication provider:

- Clerk or Auth.js

Authentication requirements:

- All dashboard routes require an authenticated user.
- API routes validate the current user before accessing protected resources.

Authorization requirements:

- Users can only access brands and campaigns they own or belong to.
- Role-based access control should support Owner, Admin, Editor, and Viewer roles.

## AI Provider

Planned AI providers:

- OpenAI or Anthropic API

AI inputs:

- Brand name
- Industry
- Tone of voice
- Target audience
- Product description
- Campaign goal
- Platform
- Uploaded brand documents

AI outputs:

- Campaign concepts
- Social captions
- Ad hooks
- Video ideas
- Image prompts
- Content calendar ideas

AI usage requirements:

- Track AI usage per user.
- Limit generations by subscription plan.
- Allow users to regenerate or edit outputs.
- Prevent private brand data from being exposed across users.

### Future RAG Flow

1. User uploads brand documents.
2. Documents are parsed and chunked.
3. Chunks are embedded and stored.
4. Relevant chunks are retrieved during campaign generation.
5. AI uses brand context to generate more accurate outputs.

## File Storage

Planned storage options:

- Cloudflare R2
- AWS S3
- Supabase Storage

Storage responsibilities:

- Store logos, product images, brand guidelines, and other uploaded assets.
- Persist file metadata in the database.
- Validate file type, file size, and ownership before accepting uploads.
- Ensure users can only access files associated with brands they are authorized to use.

## Payments

Planned payment provider:

- Stripe

Payment components:

- Stripe Checkout
- Stripe Customer Portal
- Stripe webhooks

Billing flow:

1. User selects a plan.
2. Stripe Checkout opens.
3. Stripe webhook confirms payment.
4. Subscription data is updated in the database.
5. AI usage limits are updated for the user.

Webhook security:

- Stripe webhook signatures must be verified before subscription data is updated.

## Deployment

Planned deployment stack:

- Vercel for application hosting
- GitHub Actions for CI/CD
- Docker for local development

Planned environments:

- Local
- Preview
- Production

CI/CD should run:

- Linting
- Type checks
- Tests
- Build verification
- Deployment to Vercel

## Monitoring and Analytics

Planned monitoring tools:

- Sentry for error tracking
- PostHog for product analytics

Monitoring should cover:

- Application errors
- API failures
- AI generation failures
- Billing webhook failures
- User behavior across onboarding, campaign creation, and billing flows

## Background Jobs and Automations

Potential automation tools:

- Trigger.dev
- Inngest
- n8n

Background jobs can support:

- Long-running AI tasks
- Brand document processing
- Embedding generation
- Campaign export generation
- Email notifications
- Usage and billing synchronization

## High-Level System Flow

1. User interacts with the Next.js frontend.
2. Frontend sends requests to protected API routes or server actions.
3. Backend validates authentication and permissions.
4. Backend reads and writes data through Prisma.
5. Uploaded files are stored in object storage.
6. AI requests are sent to the selected AI provider.
7. Long-running tasks are handled by a background job processor.
8. Stripe webhooks update billing and subscription status.
9. Sentry and PostHog monitor errors and user behavior.

## Planned API Surface

### Auth

- `GET /api/me`

### Brands

- `POST /api/brands`
- `GET /api/brands`
- `GET /api/brands/:id`
- `PATCH /api/brands/:id`
- `DELETE /api/brands/:id`

### Campaigns

- `POST /api/campaigns`
- `GET /api/campaigns`
- `GET /api/campaigns/:id`
- `PATCH /api/campaigns/:id`
- `DELETE /api/campaigns/:id`

### AI

- `POST /api/ai/generate-campaign`
- `POST /api/ai/generate-captions`
- `POST /api/ai/generate-hooks`

### Uploads

- `POST /api/uploads`
- `DELETE /api/uploads/:id`

### Billing

- `POST /api/stripe/checkout`
- `POST /api/stripe/customer-portal`
- `POST /api/webhooks/stripe`

## Security Considerations

- Validate all API input with Zod before database access.
- Enforce ownership checks for brands, campaigns, assets, and subscriptions.
- Check uploaded files for type, size, and ownership.
- Verify Stripe webhook signatures.
- Sanitize user prompts before sending them to the AI provider.
- Rate-limit AI generation endpoints to prevent abuse and control cost.
- Log important actions such as uploads, billing changes, campaign generation, and role changes.
