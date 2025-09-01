# InboxPilot Launch Guide - From Code to Revenue

## Step 1: Initial Setup (30 minutes)

### 1.1 Create Project Directory
```bash
# Create project folder
mkdir inboxpilot
cd inboxpilot

# Create all files from the code provided above
# Copy each code block into its respective file
```

### 1.2 Install Dependencies
```bash
# Install Node.js 18+ if not installed
# Then run:
npm install
# or
pnpm install
```

### 1.3 Generate Encryption Key
```bash
# Generate a secure encryption key for your .env.local file
openssl rand -base64 32
# Copy this output for ENCRYPTION_KEY

# Generate NextAuth secret
openssl rand -base64 32  
# Copy this output for NEXTAUTH_SECRET

# Generate cron secret
openssl rand -hex 16
# Copy this output for CRON_SECRET
```

## Step 2: Database Setup - Neon (10 minutes)

1. **Create Neon Account**
   - Go to https://neon.tech
   - Sign up for free account
   - Create new project named "inboxpilot"

2. **Get Connection String**
   - In Neon dashboard, click "Connection Details"
   - Copy the connection string (starts with `postgresql://`)
   - Add to `.env.local` as DATABASE_URL

3. **Initialize Database**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Verify with Prisma Studio
npx prisma studio
```

## Step 3: Google OAuth Setup (20 minutes)

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com
   - Create new project "InboxPilot"
   - Note the Project ID

2. **Enable Gmail API**
   - Go to "APIs & Services" > "Library"
   - Search "Gmail API"
   - Click Enable

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type
   - Fill in:
     - App name: InboxPilot
     - User support email: your email
     - App logo: upload a logo (optional)
     - App domain: your domain (when ready)
     - Developer contact: your email
   - Add scopes:
     - `openid`
     - `email` 
     - `profile`
     - `https://www.googleapis.com/auth/gmail.readonly`
   - Add test users (your email for testing)
   - Submit for verification later when ready

4. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "InboxPilot Web Client"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (dev)
     - `https://yourdomain.com/api/auth/callback/google` (production - add later)
   - Copy Client ID and Client Secret to `.env.local`

## Step 4: Anthropic API Setup (5 minutes)

1. **Create Anthropic Account**
   - Go to https://console.anthropic.com
   - Sign up and add payment method
   - Go to "API Keys"
   - Create new key
   - Copy to `.env.local` as ANTHROPIC_API_KEY

## Step 5: Lemon Squeezy Setup (30 minutes)

1. **Create Lemon Squeezy Account**
   - Go to https://lemonsqueezy.com
   - Sign up for seller account
   - Complete tax information (required for payouts)

2. **Create Store**
   - Navigate to "Stores"
   - Create store named "InboxPilot"
   - Note the Store ID from URL

3. **Create Product**
   - Go to "Products" > "Create Product"
   - Name: "InboxPilot Pro"
   - Description: "AI-powered email management"
   - Pricing model: "Subscription"
   - Create Variant:
     - Name: "Monthly Plan"
     - Price: $9.99/month
     - Trial: 7 days free (optional)
   - Note the Variant ID

4. **API Configuration**
   - Go to "Settings" > "API"
   - Create API key
   - Copy to `.env.local`

5. **Webhook Setup** (do after deployment)
   - Go to "Settings" > "Webhooks"
   - Add endpoint: `https://yourdomain.com/api/webhooks/lemonsqueezy`
   - Select events:
     - `subscription_created`
     - `subscription_updated`  
     - `subscription_cancelled`
     - `subscription_expired`
   - Copy webhook secret to `.env.local`

## Step 6: Local Testing

1. **Create `.env.local`** file:
```env
DATABASE_URL="your-neon-connection-string"
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_AUTH_SCOPES="openid email profile https://www.googleapis.com/auth/gmail.readonly"

ANTHROPIC_API_KEY="sk-ant-..."
ENCRYPTION_KEY="your-generated-key"
CRON_SECRET="your-cron-secret"

LEMONSQUEEZY_API_KEY="your-api-key"
LEMONSQUEEZY_STORE_ID="12345"
LEMONSQUEEZY_VARIANT_ID="67890"
LEMONSQUEEZY_WEBHOOK_SECRET="your-webhook-secret"
LEMONSQUEEZY_CHECKOUT_SUCCESS_URL="http://localhost:3000/dashboard"
LEMONSQUEEZY_CHECKOUT_CANCEL_URL="http://localhost:3000/pricing"
```

2. **Run Development Server**
```bash
npm run dev
```

3. **Test Flow**
   - Visit http://localhost:3000
   - Click "Get Started"
   - Sign in with Google
   - Complete checkout (use Lemon Squeezy test mode)
   - Connect Gmail
   - Sync emails

## Step 7: Deploy to Vercel (15 minutes)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
# Create repo on GitHub
git remote add origin https://github.com/yourusername/inboxpilot.git
git push -u origin main
```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Import GitHub repository
   - Add all environment variables from `.env.local`
   - Deploy

3. **Update OAuth Redirect**
   - Get Vercel URL (e.g., `inboxpilot.vercel.app`)
   - Go to Google Cloud Console
   - Add redirect URI: `https://inboxpilot.vercel.app/api/auth/callback/google`
   - Update NEXTAUTH_URL in Vercel env vars

4. **Configure Lemon Squeezy Webhook**
   - Add webhook URL: `https://inboxpilot.vercel.app/api/webhooks/lemonsqueezy`
   - Update checkout URLs in env vars

## Step 8: Custom Domain (Optional but Recommended)

1. **Buy Domain**
   - Namecheap, GoDaddy, or Cloudflare
   - Suggested: inboxpilot.com or similar

2. **Configure in Vercel**
   - Go to project settings > Domains
   - Add custom domain
   - Follow DNS instructions

3. **Update All URLs**
   - Google OAuth redirect
   - Lemon Squeezy webhooks
   - NEXTAUTH_URL
   - Checkout success/cancel URLs

## Step 9: Go Live Checklist

### Technical Requirements ✓
- [ ] Database connected and migrated
- [ ] Google OAuth working
- [ ] Gmail API fetching emails
- [ ] AI summaries generating
- [ ] Payment processing working
- [ ] Webhook receiving events
- [ ] Email retention/deletion working
- [ ] All environment variables set

### Legal Requirements ✓
- [ ] Privacy Policy live at /privacy
- [ ] Terms of Service live at /terms
- [ ] Cookie consent (if needed for your region)
- [ ] GDPR compliance (if serving EU)

### Google OAuth Verification (for production)
- [ ] Submit for verification in Google Cloud Console
- [ ] Provide privacy policy URL
- [ ] Provide terms of service URL
- [ ] Complete verification questionnaire
- [ ] Wait 3-7 days for approval

## Step 10: Marketing & Launch

### Pre-Launch (1 week before)
1. **Create Landing Page Assets**
   - Screenshots of dashboard
   - Demo video (Loom or similar)
   - Feature graphics

2. **Social Media Presence**
   - Twitter/X account
   - LinkedIn company page
   - ProductHunt profile

3. **Content Marketing**
   - Write launch blog post
   - Create comparison posts (vs manual email management)
   - Prepare email templates

### Launch Day
1. **ProductHunt Launch**
   - Submit at 12:01 AM PST
   - Notify your network
   - Engage with comments

2. **Social Media Campaign**
   - Twitter thread about the problem/solution
   - LinkedIn post for professionals
   - Reddit posts in relevant subreddits:
     - r/productivity
     - r/gmail
     - r/SaaS
     - r/Entrepreneur

3. **Direct Outreach**
   - Email your network
   - Post in relevant Slack/Discord communities
   - Reach out to productivity influencers

### Post-Launch Growth
1. **SEO Optimization**
   - Target keywords: "gmail ai assistant", "email summarizer", "inbox management"
   - Create blog content
   - Build backlinks

2. **Paid Advertising** (optional)
   - Google Ads for "gmail productivity tools"
   - Facebook/LinkedIn ads targeting professionals
   - Twitter ads for productivity audience

3. **Partnerships**
   - Reach out to productivity YouTubers
   - Guest posts on productivity blogs
   - Affiliate program setup

## Revenue Projections

### Pricing Strategy
- **Current**: $9.99/month
- **Consider adding**:
  - Annual plan: $99/year (2 months free)
  - Team plan: $19.99/month for 3 users
  - Enterprise: Custom pricing

### Growth Targets
- Month 1: 10 customers = $100 MRR
- Month 3: 50 customers = $500 MRR  
- Month 6: 200 customers = $2,000 MRR
- Year 1: 1,000 customers = $10,000 MRR

### Customer Acquisition Cost (CAC)
- Organic: ~$0
- Paid ads: ~$20-50 per customer
- Aim for 3:1 LTV/CAC ratio

## Monitoring & Support

### Set Up Monitoring
1. **Vercel Analytics** (built-in)
2. **Google Analytics** (optional)
3. **Sentry** for error tracking (optional)

### Customer Support
1. Create support email (support@yourdomain.com)
2. Set up Crisp or Intercom chat (optional)
3. Create FAQ page
4. Document common issues

### Daily Operations
- Check Lemon Squeezy dashboard
- Monitor Vercel logs for errors
- Respond to support emails
- Check Gmail API quotas
- Monitor Anthropic usage/costs

## Cost Management

### Monthly Costs (Estimate)
- Vercel: $0-20 (free tier usually sufficient)
- Neon Database: $0-20 (free tier for start)
- Anthropic API: ~$0.003 per email batch = $30-100/month at scale
- Domain: ~$1/month
- Google Workspace (optional): $6/month
- **Total**: ~$50-150/month initially

### Break-even Point
- Need ~15 customers to break even
- Achievable within 1-2 months

## Troubleshooting Common Issues

### "Gmail access denied"
- Ensure Gmail API is enabled
- Check OAuth scopes include gmail.readonly
- Re-authenticate with prompt=consent

### "Subscription not activating"  
- Check webhook signature verification
- Verify Lemon Squeezy webhook events are received
- Check Vercel function logs

### "AI summaries failing"
- Check Anthropic API key is valid
- Monitor API rate limits
- Verify JSON repair logic is working

## Next Steps After Launch

1. **Gather Feedback**
   - Add feedback widget
   - Email customers after 1 week
   - Track feature requests

2. **Iterate Based on Usage**
   - Monitor which features are most used
   - A/B test pricing
   - Optimize onboarding flow

3. **Scale Infrastructure**
   - Upgrade Neon plan if needed
   - Implement caching for common queries
   - Consider job queue for large batches

Remember: Launch fast, iterate based on feedback, and focus on solving your customers' email overload problem!