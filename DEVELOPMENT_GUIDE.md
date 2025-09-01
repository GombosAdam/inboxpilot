# InboxPilot Development Guide

## Project Overview

InboxPilot is a modern web application that uses AI to automatically process, categorize, and summarize Gmail emails. Built with Next.js 14 and powered by Anthropic's Claude AI, it helps users manage their inbox more efficiently by providing intelligent email summaries, priority detection, and automated categorization.

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animations and interactions
- **Radix UI** - Accessible UI components
- **React Hook Form** - Form handling
- **Date-fns** - Date utilities

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **NextAuth.js** - Authentication with Google OAuth
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database

### AI & External Services
- **Anthropic Claude** - AI email processing
- **Google Gmail API** - Email access
- **Lemon Squeezy** - Payment processing
- **Node.js Crypto** - Data encryption

### Development Tools
- **Vitest** - Testing framework
- **ESLint** - Code linting
- **TypeScript** - Static type checking

## Database Schema

### Core Models

#### User
```prisma
model User {
  id                  String         @id @default(cuid())
  email               String         @unique
  emailVerified       DateTime?
  name                String?
  image               String?
  createdAt           DateTime       @default(now())
  
  // Billing (Lemon Squeezy)
  lemonCustomerId     String?
  lemonSubscriptionId String?
  subscriptionStatus  String         @default("inactive")
  subscriptionPlan    String         @default("free")
  
  // Gmail OAuth
  googleEmail         String?
  googleRefreshToken  String?        @db.Text
  
  // AI usage & settings
  dailyQuota          Int            @default(300)
  
  accounts            Account[]
  sessions            Session[]
  summaries           EmailSummary[]
  usageDaily          UsageDaily[]
  settings            UserSettings?
}
```

#### EmailSummary
```prisma
model EmailSummary {
  id             String    @id @default(cuid())
  userId         String
  gmailMessageId String
  sender         String
  subject        String
  snippet        String?
  summary        String
  suggestedReply String?
  priority       String
  label          String
  receivedAt     DateTime  @default(now())
  createdAt      DateTime  @default(now())
  archived       Boolean   @default(false)
  archivedAt     DateTime?
  
  user User @relation(fields: [userId], references: [id])
  
  @@unique([userId, gmailMessageId])
  @@index([userId, receivedAt])
  @@index([userId, archived])
}
```

#### UsageDaily
```prisma
model UsageDaily {
  userId        String
  date          DateTime @default(dbgenerated("CURRENT_DATE")) @db.Date
  prompts       Int      @default(0)
  emailsScanned Int      @default(0)
  emailsLabeled Int      @default(0)
  
  user User @relation(fields: [userId], references: [id])
  
  @@id([userId, date])
}
```

#### UserSettings
```prisma
model UserSettings {
  userId          String  @id
  byoApiKey       Boolean @default(false)
  anthropicApiKey String? @db.Text
  retainDays      Int     @default(14)
  
  user User @relation(fields: [userId], references: [id])
}
```

## Architecture Overview

### Authentication Flow
1. **Google OAuth Setup**: Uses NextAuth.js with Google provider
2. **Scope Permissions**: Requests Gmail read-only access
3. **Token Management**: Encrypts and stores refresh tokens
4. **Session Handling**: JWT-based sessions with user metadata

### Email Processing Pipeline
1. **Gmail Integration**: Fetches unread emails from last 3 days
2. **AI Processing**: Sends emails to Claude for analysis
3. **Data Storage**: Saves summaries and metadata to database
4. **Usage Tracking**: Records processing statistics

### AI Processing Workflow
```typescript
interface EmailSummary {
  subject: string;
  sender: string;
  summary: string;
  priority: 'low' | 'normal' | 'high';
  label: string;
  suggestedReply?: string;
  promotionalData?: {
    type: 'newsletter' | 'sale' | 'product-launch' | 'coupon' | 'reminder' | 'survey' | 'event';
    discount?: string;
    expiryDate?: string;
    keyProducts?: string[];
    callToAction?: string;
    brandCategory?: 'retail' | 'saas' | 'media' | 'finance' | 'food' | 'travel' | 'other';
  };
}
```

## API Endpoints

### Authentication
- `GET /api/auth/[...nextauth]` - NextAuth.js handler
- `GET /api/me` - Get current user info

### Email Processing
- `POST /api/sync` - Sync and process Gmail emails
- `GET /api/emails` - Retrieve processed emails
- `POST /api/emails/cleanup` - Clean up old emails

### Usage & Limits
- `GET /api/check-usage` - Check current usage limits
- `GET /api/usage` - Get usage statistics

### Subscription
- `POST /api/checkout` - Create Lemon Squeezy checkout
- `POST /api/subscription/sync` - Sync subscription status
- `POST /api/webhooks/lemonsqueezy` - Handle payment webhooks

### Cron Jobs
- `POST /api/cron/cleanup` - Automated cleanup task

## Key Components

### ModernEmailList (`src/components/ModernEmailList.tsx`)
Advanced email list component with:
- Infinite scroll support
- Email expansion/collapse
- Bulk selection
- Priority indicators
- Category badges
- Promotional data display
- Suggested replies
- Smooth animations

### Dashboard (`src/app/dashboard/page.tsx`)
Main application interface featuring:
- Usage statistics
- Email processing controls
- Account status indicators
- Real-time sync progress
- Visual analytics

### Email Processing (`src/server/ai.ts`)
Claude integration for:
- Email summarization
- Priority detection
- Category assignment
- Suggested reply generation
- Promotional content analysis

## Security Implementation

### Data Encryption
```typescript
// AES-256-GCM encryption for sensitive data
export function encrypt(text: string): string;
export function decrypt(encryptedData: string): string;
```

### Google OAuth Security
- Read-only Gmail permissions
- Encrypted refresh token storage
- Secure callback handling

### Webhook Security
```typescript
export function verifyWebhookSignature(rawBody: string, signature: string): boolean;
```

## Subscription System

### Plan Configuration
```typescript
export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    emailsPerMonth: 5000,
    retentionDays: 7,
    features: ['basic_summary', 'categorization']
  },
  starter: {
    emailsPerMonth: 5000,
    retentionDays: 30,
    features: ['basic_summary', 'categorization', 'suggested_replies', 'priority_detection']
  },
  professional: {
    emailsPerMonth: 20000,
    retentionDays: 90,
    features: ['basic_summary', 'categorization', 'suggested_replies', 'priority_detection', 'custom_labels', 'bulk_actions', 'api_access']
  },
  business: {
    emailsPerMonth: -1, // unlimited
    retentionDays: 365,
    features: ['all']
  }
};
```

### Lemon Squeezy Integration
- Checkout URL generation
- Webhook handling for subscription events
- Automatic plan synchronization

## Environment Variables

### Required Production Variables
```bash
# Deployment
NEXTAUTH_URL="https://yourdomain.com"

# Security Keys (Generate new ones!)
NEXTAUTH_SECRET="your-secret-key"
ENCRYPTION_KEY="your-base64-encryption-key"
CRON_SECRET="your-cron-secret"

# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_AUTH_SCOPES="openid email profile https://www.googleapis.com/auth/gmail.readonly"

# Anthropic AI
ANTHROPIC_API_KEY="sk-ant-api03-..."

# Lemon Squeezy
LEMONSQUEEZY_API_KEY="your-api-key"
LEMONSQUEEZY_STORE_ID="your-store-id"
LEMONSQUEEZY_VARIANT_ID_STARTER="starter-variant-id"
LEMONSQUEEZY_VARIANT_ID_PRO="pro-variant-id"
LEMONSQUEEZY_WEBHOOK_SECRET="webhook-signing-secret"
```

## Development Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google Cloud Project (for OAuth)
- Anthropic API account
- Lemon Squeezy store (for payments)

### Installation
```bash
# Clone repository
git clone [repository-url]
cd ai-gmail-sorter

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Setup database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

### Google OAuth Setup
1. Create Google Cloud Project
2. Enable Gmail API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)

**Note: The application MUST always run on port 3000. Use `npm run dev -- -p 3000` to force port 3000.**
   - `https://yourdomain.com/api/auth/callback/google` (production)

### Database Commands
```bash
# Generate Prisma client
npm run prisma:generate

# Push schema changes
npm run prisma:push

# Open Prisma Studio
npm run prisma:studio
```

## Testing

### Test Structure
- Unit tests for utility functions
- Integration tests for API routes
- Authentication flow tests
- Gmail API integration tests

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Deployment

### Vercel Deployment (Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Environment-Specific Configurations
- Update `NEXTAUTH_URL` to production domain
- Configure database connection string
- Update Google OAuth redirect URIs
- Set up Lemon Squeezy webhook endpoint

## Performance Optimizations

### Email Processing
- Batch processing for multiple emails
- Efficient database queries with proper indexing
- Connection pooling for database
- Rate limiting for AI API calls

### Frontend Optimizations
- Code splitting with dynamic imports
- Image optimization with Next.js Image component
- Lazy loading for email components
- Optimized bundle size

### Caching Strategy
- User session caching
- API response caching where appropriate
- Static asset caching

## Monitoring & Analytics

### Error Handling
- Comprehensive error logging
- User-friendly error messages
- Fallback mechanisms for AI failures

### Usage Tracking
- Daily email processing counts
- User engagement metrics
- Subscription conversion tracking

## Common Development Tasks

### Adding New Email Categories
1. Update category configuration in `ModernEmailList.tsx`
2. Modify AI prompt in `src/server/ai.ts`
3. Update database schema if needed

### Extending AI Processing
1. Modify the `processEmails` function in `src/server/ai.ts`
2. Update the `EmailSummary` interface
3. Adjust database schema accordingly

### Adding New Subscription Features
1. Update `PLAN_LIMITS` in `src/lib/subscription-limits.ts`
2. Implement feature checks in relevant components
3. Update pricing display components

### Customizing UI Components
- Components use Tailwind CSS with custom design tokens
- Animations powered by Framer Motion
- Responsive design with mobile-first approach

## Troubleshooting

### Common Issues
1. **Gmail API Rate Limits**: Implement exponential backoff
2. **AI Processing Timeouts**: Increase timeout values and implement retry logic
3. **Database Connection Issues**: Check connection string and network access
4. **OAuth Callback Errors**: Verify redirect URIs and client configuration

### Debug Mode
Set `NODE_ENV=development` for additional logging and error details.

### Performance Monitoring
- Monitor database query performance
- Track AI API response times
- Monitor memory usage during email processing

## Contributing Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Write descriptive commit messages

### Testing Requirements
- Add tests for new features
- Maintain test coverage above 80%
- Test both happy path and error scenarios

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Update documentation if needed
4. Submit PR with detailed description

This development guide provides a comprehensive overview of the InboxPilot codebase, architecture, and development practices. It should serve as a complete reference for developers working on the project.