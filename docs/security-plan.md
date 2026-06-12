# Security Plan: ai-creativeops-studio

## 1. Overview

This security plan defines the MVP security requirements for ai-creativeops-studio.

The goal is to protect user accounts, brand data, uploaded assets, AI-generated campaign data, billing records, and production operations without over-engineering the first version.

The MVP security approach uses the existing architecture decisions:

- Auth.js for authentication
- PostgreSQL and Prisma for database access
- Cloudflare R2 for file storage
- OpenAI API for AI generation
- Stripe for payments
- Sentry for error monitoring
- PostHog for product analytics

## 2. Security Goals

- Require authentication for all private dashboard and API access.
- Ensure users can only access their own brands, campaigns, assets, subscriptions, and AI usage records.
- Validate all untrusted input before it reaches the database, AI provider, payment provider, or file storage.
- Protect uploaded files from unauthorized access and unsafe file types.
- Verify payment and webhook events before updating billing data.
- Prevent private brand data from leaking into another user's AI context.
- Limit AI usage and rate-limit expensive or sensitive endpoints.
- Keep secrets out of source control and client-side code.
- Monitor production errors and important product events.

## 3. Authentication

Auth.js will handle user login, signup, and session management.

### MVP Requirements

- Use Auth.js for all authentication flows.
- Require an active session for all `/dashboard/*` routes.
- Require an active session for all private API routes.
- Store only the user data needed for the MVP, such as email, name, role, and Stripe customer ID.
- Do not expose session secrets, provider secrets, or tokens to the client.
- Use secure cookie settings in production.

### Protected Areas

```txt
/dashboard/*
/api/me
/api/brands/*
/api/campaigns/*
/api/ai/*
/api/uploads/*
/api/stripe/*
```

## 4. Authorization

Authorization will be enforced in the API layer before reading or writing private data.

### MVP Ownership Rule

```txt
A user can only access records that belong to their own account.
```

### Records Requiring Ownership Checks

- Brand
- Campaign
- Asset
- Subscription
- AiUsage

### Authorization Flow

Each private API request should:

1. Confirm the user is authenticated.
2. Validate the request input.
3. Load the requested record through Prisma.
4. Confirm the record belongs to the authenticated user.
5. Confirm the user is allowed to perform the requested action.
6. Return a safe response without leaking unrelated data.

## 5. Role-Based Access Control

The MVP can start with a simple role model.

### MVP Roles

- `owner`
- `admin`

For the first version, most users will be treated as workspace owners.

### Future Roles

Future team collaboration can introduce:

- Owner
- Admin
- Editor
- Viewer

These roles should be implemented later with team or organization membership models. Until then, direct user ownership is the main authorization rule.

## 6. Input Validation

All user-controlled input must be validated before it is used.

### Validation Requirements

- Validate API request bodies before database writes.
- Validate route parameters before database reads.
- Validate campaign generation inputs before building AI prompts.
- Validate billing plan IDs before creating Stripe Checkout sessions.
- Validate upload metadata before accepting files.
- Return clear validation errors without exposing internal stack traces.

### Recommended Validation Targets

- Brand name
- Industry
- Tone of voice
- Brand colors
- Brand fonts
- Target audience
- Campaign goal
- Product information
- Campaign platform
- File metadata
- Billing plan

### Contractor Note

Zod is the recommended validation library in the technical architecture. Validation schemas should be added during implementation, not during this documentation ticket.

## 7. File Upload Security

Cloudflare R2 will store uploaded brand files.

### Supported MVP File Types

- Logos
- Product images
- Brand guidelines
- PDF documents
- Reference images

### File Security Requirements

- Validate file type before upload.
- Validate file size before upload.
- Reject executable or unsupported file types.
- Store files in Cloudflare R2, not in the application repository.
- Store only file metadata in PostgreSQL through Prisma.
- Associate each uploaded file with a brand and uploading user.
- Confirm the authenticated user owns the brand before accepting the upload.
- Use signed URLs or server-mediated access for private files.
- Prevent users from accessing files attached to brands they do not own.

### Upload Flow

```txt
User selects file
API checks authentication
API validates file metadata
API verifies brand ownership
API uploads file to Cloudflare R2
API stores Asset metadata in PostgreSQL
User sees the asset in the brand kit
```

## 8. Payment Security

Stripe will manage subscription checkout, customer portal access, and billing status.

### Payment Security Requirements

- Create Stripe Checkout sessions only for authenticated users.
- Validate selected plan IDs on the server.
- Do not trust client-provided prices, plan names, or billing status.
- Store Stripe customer and subscription IDs in PostgreSQL.
- Use Stripe Customer Portal for subscription management.
- Treat Stripe webhook events as the source of truth for subscription status.
- Do not upgrade plan access until the relevant Stripe webhook confirms payment or subscription activation.

## 9. Stripe Webhook Verification

Stripe webhook endpoints must verify event signatures before processing events.

### Webhook Requirements

- Verify the Stripe signature using `STRIPE_WEBHOOK_SECRET`.
- Reject webhook requests with missing or invalid signatures.
- Process only expected event types.
- Make webhook handling idempotent when possible.
- Log webhook failures to Sentry.
- Never expose webhook secrets to the frontend.

### MVP Webhook Events

The MVP should be prepared to handle events such as:

- Checkout completed
- Subscription created
- Subscription updated
- Subscription canceled
- Invoice payment failed

The exact Stripe event names should be finalized during payment implementation.

## 10. AI Prompt and Data Security

OpenAI API will generate campaign ideas and related creative outputs.

### AI Security Requirements

- Send only the brand and campaign data required for generation.
- Keep prompts scoped to the authenticated user's selected brand.
- Confirm brand ownership before loading brand context for AI generation.
- Do not include another user's brand assets, campaigns, or private data in the prompt.
- Validate campaign inputs before building prompts.
- Validate structured AI output before saving it.
- Do not log full prompts or private brand documents in production logs.
- Allow users to edit or regenerate AI outputs.

### Private Data Rule

```txt
Private brand context must never be shared across user accounts.
```

## 11. AI Usage Limits

AI generation is a cost-sensitive feature and must be limited by plan.

### MVP Usage Rules

- Track each AI generation in the `AiUsage` table.
- Check the user's subscription plan before generating AI output.
- Enforce monthly generation limits by plan.
- Block or prompt for upgrade when a user exceeds their plan limit.
- Track action type, such as campaign generation, caption generation, or hook generation.
- Store token usage when the AI provider returns reliable usage data.

### Plan-Level Intent

- Free users receive limited AI generations.
- Pro users receive higher generation limits.
- Agency users receive the highest limits and future multi-brand support.

## 12. Rate Limiting

Rate limiting protects the application from abuse and controls infrastructure and AI costs.

### Endpoints to Rate Limit

- Login and signup routes
- AI generation endpoints
- File upload endpoints
- Stripe Checkout creation
- Public forms, if added later

### MVP Rate Limit Approach

- Apply stricter limits to unauthenticated routes.
- Apply user-based limits to authenticated routes.
- Apply plan-based limits to AI generation routes.
- Return clear rate-limit responses.
- Log suspicious abuse patterns for review.

## 13. Audit Logging

Audit logging should capture important security and business events.

### MVP Events to Log

- User signup
- Brand creation
- Brand updates
- Asset uploads
- Asset deletions
- Campaign generation
- Campaign save or archive actions
- Stripe checkout start
- Subscription status changes
- Failed webhook verification
- Authorization failures
- AI usage limit blocks

### Logging Guidelines

- Do not log secrets.
- Do not log full payment details.
- Do not log full private prompts or uploaded document contents.
- Include enough metadata to troubleshoot issues, such as user ID, brand ID, action type, and timestamp.

## 14. Environment Variable Security

Secrets must be stored in environment variables and never committed to GitHub.

### Required Secret Categories

- Database connection string
- Auth.js secret
- OpenAI API key
- Stripe secret key
- Stripe webhook secret
- Cloudflare R2 credentials
- Sentry DSN
- PostHog keys

### Environment Rules

- Use separate environment values for local, preview, and production.
- Do not commit `.env` files.
- Keep `.env.example` limited to placeholders when it is added in a later ticket.
- Never expose server-only secrets through `NEXT_PUBLIC_` variables.
- Rotate secrets if they are accidentally exposed.
- Limit access to production secrets to trusted maintainers.

## 15. Production Monitoring

Sentry and PostHog will provide production visibility.

### Sentry Monitoring

Sentry should capture:

- API errors
- Authentication failures that indicate system issues
- Authorization errors that indicate possible abuse
- AI generation failures
- Stripe webhook failures
- File upload failures
- Unexpected production exceptions

Sensitive payloads, secrets, prompts, and private brand documents should be filtered before they reach Sentry.

### PostHog Analytics

PostHog should track product events such as:

- Signup completed
- Brand created
- Asset uploaded
- Campaign generated
- Campaign saved
- Checkout started
- Subscription activated

PostHog should not receive secrets, full payment details, full private prompts, or uploaded document contents.

## 16. MVP Security Checklist

Ticket 4 is complete when this plan documents:

- Authentication with Auth.js
- Authorization and ownership checks
- Role-based access control approach
- Input validation requirements
- File upload security for Cloudflare R2
- Payment security with Stripe
- Stripe webhook verification
- AI prompt and data security for OpenAI
- AI usage limits
- Rate limiting
- Audit logging
- Environment variable security
- Production monitoring with Sentry and PostHog
