# Stripe Integration Setup Guide

This guide will help you set up Stripe payments for InboxPilot.

## Prerequisites

1. Create a [Stripe account](https://stripe.com)
2. Verify your business details in Stripe Dashboard

## Step 1: Get API Keys

1. Go to **Stripe Dashboard** → **Developers** → **API Keys**
2. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)
4. Add to your `.env.local`:

```bash
STRIPE_PUBLISHABLE_KEY="pk_test_your_key_here"
STRIPE_SECRET_KEY="sk_test_your_key_here"
```

## Step 2: Create Products & Prices

### Create Products in Stripe Dashboard:

1. Go to **Products** → **Add product**

#### Starter Plan
- **Name**: InboxPilot Starter
- **Description**: 600 emails/month + advanced features
- **Pricing**: Recurring, Monthly, $9.00 USD
- Copy the **Price ID** (starts with `price_`)

#### Professional Plan  
- **Name**: InboxPilot Professional
- **Description**: 20,000 emails/month + pro features
- **Pricing**: Recurring, Monthly, $29.00 USD
- Copy the **Price ID**

#### Business Plan
- **Name**: InboxPilot Business  
- **Description**: Unlimited emails + business features
- **Pricing**: Recurring, Monthly, $99.00 USD
- Copy the **Price ID**

### Add Price IDs to Environment:

```bash
STRIPE_PRICE_ID_STARTER="price_your_starter_id"
STRIPE_PRICE_ID_PROFESSIONAL="price_your_pro_id" 
STRIPE_PRICE_ID_BUSINESS="price_your_business_id"
```

## Step 3: Set Up Webhooks

1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
3. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated` 
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to environment:

```bash
STRIPE_WEBHOOK_SECRET="whsec_your_signing_secret"
```

## Step 4: Test the Integration

### Test Mode (Development)
1. Use test API keys (pk_test_... and sk_test_...)
2. Use [test card numbers](https://stripe.com/docs/testing#cards)
3. Test successful payment: `4242424242424242`
4. Test declined payment: `4000000000000002`

### Production Mode
1. Switch to live API keys (pk_live_... and sk_live_...)
2. Update webhook endpoint to production URL
3. Test with real payment methods

## Step 5: Verify Setup

1. **Test Checkout**: Click "Upgrade to Starter" → Should redirect to Stripe Checkout
2. **Complete Payment**: Use test card → Should redirect back to dashboard
3. **Check Database**: User should have `subscriptionStatus: 'active'` and `subscriptionPlan: 'Starter'`  
4. **Test Webhook**: Check server logs for successful webhook processing

## Troubleshooting

### Webhook Not Working
- Verify webhook URL is publicly accessible
- Check webhook signing secret matches environment variable
- Review webhook event logs in Stripe Dashboard

### Checkout Fails
- Verify Price IDs are correct in environment variables
- Check API keys are valid and not expired
- Review error logs for specific error messages

### User Not Upgraded
- Check webhook events are being received
- Verify user email matches between checkout and database
- Check database for subscription updates

## Security Notes

- Never expose secret keys in frontend code
- Use HTTPS for all webhook endpoints
- Validate webhook signatures before processing
- Store sensitive data securely

## Production Checklist

- [ ] Switch to live Stripe keys
- [ ] Update webhook endpoint to production URL  
- [ ] Test real payment flow end-to-end
- [ ] Set up monitoring for failed payments
- [ ] Configure customer emails and receipts
- [ ] Set up subscription management portal (optional)