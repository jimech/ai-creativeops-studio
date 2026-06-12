# Database Schema Plan: ai-creativeops-studio

## 1. Overview

ai-creativeops-studio will use PostgreSQL as the main relational database and Prisma as the ORM.

The MVP database will support:

- User accounts
- Brand profiles
- Campaign generation records
- Uploaded brand assets
- Stripe subscription tracking
- AI usage tracking

This schema is designed for the first MVP version. It supports single-user ownership first, with room to add team collaboration later.

## 2. Core Models

The first database models are:

- User
- Brand
- Campaign
- Asset
- Subscription
- AiUsage

These models match the first version of the product and are enough to support the MVP flows:

- User signs up
- User creates a brand profile
- User uploads brand assets
- User generates an AI campaign
- User saves campaign results
- User subscribes to a paid plan
- System tracks AI usage

## 3. Entity Relationship Summary

```txt
User 1---many Brand
User 1---many AiUsage
User 1---1 Subscription

Brand 1---many Campaign
Brand 1---many Asset
```

In the MVP, a user owns one or more brands.

Each brand can have many campaigns and many uploaded assets.

Each user has one subscription record and many AI usage records.

## 4. User Model

The `User` model represents a registered account.

### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| id | String | Yes | Primary key |
| email | String | Yes | Unique email address |
| name | String | No | User display name |
| role | String | Yes | Default: `owner` |
| stripeCustomerId | String | No | Stripe customer ID |
| createdAt | DateTime | Yes | Created timestamp |
| updatedAt | DateTime | Yes | Updated timestamp |

### Relationships

```txt
User has many Brand records
User has one Subscription record
User has many AiUsage records
```

### Notes

For the MVP, every user is treated as the owner of their workspace.

Future versions can replace the simple `role` field with a full team membership model.

## 5. Brand Model

The `Brand` model stores the brand profile used for AI campaign generation.

### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| id | String | Yes | Primary key |
| ownerId | String | Yes | References User |
| name | String | Yes | Brand name |
| industry | String | Yes | Example: fashion, beauty, jewelry |
| toneOfVoice | String | No | Brand tone |
| colors | String[] | No | Brand colors |
| fonts | String[] | No | Brand fonts |
| targetAudience | String | No | Main customer profile |
| createdAt | DateTime | Yes | Created timestamp |
| updatedAt | DateTime | Yes | Updated timestamp |

### Relationships

```txt
Brand belongs to User
Brand has many Campaign records
Brand has many Asset records
```

### Notes

Brand data will be used as context for AI campaign generation.

For the MVP, a brand belongs directly to one user through `ownerId`.

## 6. Campaign Model

The `Campaign` model stores AI-generated campaign outputs.

### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| id | String | Yes | Primary key |
| brandId | String | Yes | References Brand |
| title | String | Yes | Campaign title |
| goal | String | Yes | Campaign goal |
| platform | String | Yes | Instagram, TikTok, email, ads, etc. |
| status | String | Yes | Draft, saved, archived |
| aiOutput | Json | Yes | Structured AI response |
| createdAt | DateTime | Yes | Created timestamp |
| updatedAt | DateTime | Yes | Updated timestamp |

### Relationships

```txt
Campaign belongs to Brand
```

### Notes

`aiOutput` should store structured JSON containing:

```json
{
  "campaignConcepts": [],
  "captions": [],
  "adHooks": [],
  "imagePrompts": [],
  "videoIdeas": [],
  "contentCalendarIdeas": []
}
```

This keeps the MVP flexible while the AI output format is still evolving.

## 7. Asset Model

The `Asset` model stores metadata for uploaded brand files.

### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| id | String | Yes | Primary key |
| brandId | String | Yes | References Brand |
| fileName | String | Yes | Original file name |
| fileUrl | String | Yes | Storage URL or object key |
| fileType | String | Yes | Image, PDF, logo, guideline, etc. |
| uploadedBy | String | Yes | References User |
| createdAt | DateTime | Yes | Created timestamp |

### Relationships

```txt
Asset belongs to Brand
Asset uploaded by User
```

### Notes

Files will be stored in object storage, such as Cloudflare R2.

The database stores metadata only, not the actual file contents.

## 8. Subscription Model

The `Subscription` model tracks Stripe billing status.

### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| id | String | Yes | Primary key |
| userId | String | Yes | References User |
| stripeSubscriptionId | String | No | Stripe subscription ID |
| plan | String | Yes | Free, Pro, Agency |
| status | String | Yes | Active, trialing, canceled, past_due |
| currentPeriodEnd | DateTime | No | Stripe billing period end |
| createdAt | DateTime | Yes | Created timestamp |
| updatedAt | DateTime | Yes | Updated timestamp |

### Relationships

```txt
Subscription belongs to User
```

### Notes

The subscription record determines AI generation limits and feature access.

The Free plan can exist without a Stripe subscription ID.

## 9. AiUsage Model

The `AiUsage` model tracks AI usage by user.

### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| id | String | Yes | Primary key |
| userId | String | Yes | References User |
| actionType | String | Yes | generate_campaign, generate_caption, generate_hook |
| tokensUsed | Int | No | Token count if available |
| createdAt | DateTime | Yes | Created timestamp |

### Relationships

```txt
AiUsage belongs to User
```

### Notes

This model supports monthly AI usage limits by plan.

For the MVP, usage can be counted by number of generation actions. Token tracking can be added if the AI provider returns reliable usage data.

## 10. Suggested Prisma-Like Schema Shape

This is not the final `schema.prisma` file. It is a planning reference only.

```prisma
model User {
  id               String         @id @default(cuid())
  email            String         @unique
  name             String?
  role             String         @default("owner")
  stripeCustomerId String?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  brands           Brand[]
  subscription     Subscription?
  aiUsages         AiUsage[]
  uploadedAssets   Asset[]
}

model Brand {
  id             String     @id @default(cuid())
  ownerId        String
  name           String
  industry       String
  toneOfVoice    String?
  colors         String[]
  fonts          String[]
  targetAudience String?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  owner          User       @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  campaigns      Campaign[]
  assets         Asset[]

  @@index([ownerId])
}

model Campaign {
  id        String   @id @default(cuid())
  brandId   String
  title     String
  goal      String
  platform  String
  status    String   @default("draft")
  aiOutput  Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  brand     Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)

  @@index([brandId])
}

model Asset {
  id         String   @id @default(cuid())
  brandId    String
  fileName   String
  fileUrl    String
  fileType   String
  uploadedBy String
  createdAt  DateTime @default(now())

  brand      Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)
  uploader   User     @relation(fields: [uploadedBy], references: [id])

  @@index([brandId])
  @@index([uploadedBy])
}

model Subscription {
  id                   String    @id @default(cuid())
  userId               String    @unique
  stripeSubscriptionId String?
  plan                 String    @default("free")
  status               String    @default("active")
  currentPeriodEnd     DateTime?
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model AiUsage {
  id         String   @id @default(cuid())
  userId     String
  actionType String
  tokensUsed Int?
  createdAt  DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
}
```

## 11. MVP Indexes and Constraints

Recommended constraints:

- `User.email` should be unique.
- `Subscription.userId` should be unique.
- `Brand.ownerId` should be indexed.
- `Campaign.brandId` should be indexed.
- `Asset.brandId` should be indexed.
- `Asset.uploadedBy` should be indexed.
- `AiUsage.userId` should be indexed.
- `AiUsage.createdAt` should be indexed for monthly usage checks.

These indexes support common MVP queries:

- Find brands owned by the current user.
- Find campaigns for a brand.
- Find uploaded assets for a brand.
- Find a user subscription.
- Count AI usage during the current billing period.

## 12. Future Schema Additions

Future versions may add:

- Team
- TeamMember
- BrandDocumentChunk
- Embedding
- AuditLog
- ContentCalendarItem
- CampaignExport
- Notification
- Integration

These are intentionally excluded from the MVP schema to keep the first version simple.

### Future Team Collaboration

A later version may introduce team-based access:

```txt
Team 1---many TeamMember
Team 1---many Brand
User 1---many TeamMember
```

This would replace direct single-user ownership for larger agency accounts.

### Future RAG Support

A later version may introduce document chunks and embeddings:

```txt
Asset 1---many BrandDocumentChunk
BrandDocumentChunk has embedding vector
```

This would support retrieval-augmented generation for brand guidelines and uploaded documents.

## 13. Completion Criteria

Ticket 3 is complete when:

- `docs/database-schema-plan.md` exists.
- The first six database models are defined.
- Relationships between models are documented.
- The schema supports users, brands, campaigns, assets, subscriptions, and AI usage.
- The document is clear enough to guide the later Prisma implementation ticket.
