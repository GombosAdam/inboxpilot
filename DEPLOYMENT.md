# InboxPilot Deployment Guide

## Pre-Deployment Checklist

### ✅ **Environment Variables Ready**
- Database URL (Neon PostgreSQL)
- Google OAuth credentials  
- Anthropic API key
- Stripe API keys (live mode)
- NextAuth secrets

### ✅ **Stripe Configuration**
- Live API keys configured
- Starter plan Price ID: `price_1S2a91BU9XyvMZyhkwWQvOkZ`
- Webhook endpoint will be: `https://yourdomain.com/api/webhooks/stripe`

## Deployment Steps

### 1. **Create GitHub Repository** 
```bash
git add .
git commit -m "Production ready with Stripe integration"
git push origin main
```

### 2. **Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project" 
4. Import your InboxPilot repository
5. Configure environment variables (see list below)
6. Deploy!

### 3. **Environment Variables for Vercel**
Copy these from your `.env.local`:

```bash
# Database
DATABASE_URL=postgresql://neondb_owner:npg_...

# Auth
NEXTAUTH_URL=https://your-deployed-domain.vercel.app
NEXTAUTH_SECRET=H+OpCckV4LrtdXer/d/WU/Xs1cOz...
ENCRYPTION_KEY=K9P/aNWdFr7ZH+H3nNwq6kLT0Gzz...

# Google OAuth  
GOOGLE_CLIENT_ID=893120160853-rv6voom...
GOOGLE_CLIENT_SECRET=GOCSPX-kDAMLpx0-...
GOOGLE_AUTH_SCOPES=openid email profile https://www.googleapis.com/auth/gmail.modify

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-fmekz1Q...

# Stripe (LIVE KEYS)
STRIPE_PUBLISHABLE_KEY=pk_live_51QXOyRBU9XyvMZyh...
STRIPE_SECRET_KEY=rk_live_51QXOyRBU9XyvMZyh...
STRIPE_PRICE_ID_STARTER=price_1S2a91BU9XyvMZyhkwWQvOkZ
STRIPE_WEBHOOK_SECRET=whsec_... (get after creating webhook)

# Settings
DEV_BYPASS_PAYMENTS=false
CRON_SECRET=5wet3BZUSKAIqoPD
```

### 4. **Post-Deployment Setup**

#### A) **Update Google OAuth Redirect URIs**
1. Google Cloud Console → Credentials → OAuth 2.0 Client
2. Add redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`

#### B) **Create Stripe Webhook**  
1. Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Events: `checkout.session.completed`, `customer.subscription.*`
4. Copy webhook secret → Update `STRIPE_WEBHOOK_SECRET` in Vercel

#### C) **Update Environment Variables**
- Set `NEXTAUTH_URL` to your actual domain
- Add webhook secret from step B

## Testing Checklist

### ✅ **Basic Functionality**
- [ ] App loads and login works
- [ ] Gmail OAuth connection works
- [ ] Email sync and AI processing works  
- [ ] Dashboard displays correctly

### ✅ **Payment Flow**
- [ ] "Upgrade to Starter" button works
- [ ] Redirects to Stripe Checkout
- [ ] Successful payment redirects back to dashboard
- [ ] Webhook processes payment and upgrades user
- [ ] User sees Starter plan limits (600 emails/month)

### ✅ **Security**
- [ ] All environment variables set in Vercel (not in code)
- [ ] Webhook signature verification working
- [ ] No dev bypass enabled

## Domain Setup (Optional)

If you want a custom domain:
1. Buy domain from any registrar
2. Vercel Dashboard → Project → Domains → Add
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` and webhook URLs

## Monitoring

- **Stripe Dashboard**: Monitor payments and subscriptions
- **Vercel Dashboard**: Monitor deployments and functions
- **Neon Dashboard**: Monitor database usage

## Support URLs

After deployment, these URLs will be live:
- **App**: `https://your-domain.vercel.app`
- **Webhook**: `https://your-domain.vercel.app/api/webhooks/stripe`
- **Auth Callback**: `https://your-domain.vercel.app/api/auth/callback/google`