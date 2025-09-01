# Google OAuth Setup Guide

## Quick Fix for "Error 403: access_denied"

### Step 1: Add Yourself as Test User

1. Go to: https://console.cloud.google.com
2. Select your project (top dropdown)
3. Navigate: **Menu (☰) → APIs & Services → OAuth consent screen**
4. Find **"Test users"** section
5. Click **"+ ADD USERS"**
6. Enter your Gmail address
7. Click **"SAVE"**

Now try signing in again!

## Complete OAuth Setup (If Starting Fresh)

### Step 1: Create Google Cloud Project

1. Go to: https://console.cloud.google.com
2. Click **"Select a project"** → **"New Project"**
3. Name: "InboxPilot" (or any name)
4. Click **"Create"**

### Step 2: Enable Gmail API

1. Go to: **APIs & Services → Library**
2. Search for **"Gmail API"**
3. Click on it and press **"ENABLE"**

### Step 3: Configure OAuth Consent Screen

1. Go to: **APIs & Services → OAuth consent screen**
2. Choose **"External"** (for public access)
3. Fill in:
   - App name: "InboxPilot"
   - User support email: Your email
   - App logo: (optional)
   - Application home page: http://localhost:3000 (for testing)
   - Authorized domains: (leave empty for testing)
   - Developer contact: Your email

4. Click **"SAVE AND CONTINUE"**

### Step 4: Add Scopes

1. Click **"ADD OR REMOVE SCOPES"**
2. Search and select:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/gmail.readonly`
3. Click **"UPDATE"** then **"SAVE AND CONTINUE"**

### Step 5: Add Test Users

1. Click **"+ ADD USERS"**
2. Add your email address
3. Add any other test emails
4. Click **"SAVE AND CONTINUE"**

### Step 6: Create OAuth 2.0 Credentials

1. Go to: **APIs & Services → Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Choose **"Web application"**
4. Name: "InboxPilot Web Client"
5. Add Authorized JavaScript origins:
   - http://localhost:3000
   - https://yourdomain.com (for production)
6. Add Authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google
   - https://yourdomain.com/api/auth/callback/google (for production)
7. Click **"CREATE"**

### Step 7: Copy Credentials

You'll get:
- **Client ID**: Copy this
- **Client Secret**: Copy this

Add to your `.env.local`:
```
GOOGLE_CLIENT_ID="your_client_id_here"
GOOGLE_CLIENT_SECRET="your_client_secret_here"
```

## Publishing for Production

When ready to launch publicly:

1. Go to **OAuth consent screen**
2. Click **"PUBLISH APP"**
3. Google will review (can take 1-5 days)
4. Once approved, anyone can sign in

### Verification Requirements:
- Privacy Policy URL
- Terms of Service URL
- Domain verification
- May need to submit for security review if using sensitive scopes

## Testing Mode Limits

While in testing mode:
- Max 100 test users
- No verification needed
- Consent screen shows "unverified app" warning
- Perfect for development and beta testing

## Troubleshooting

### "Access Denied" Error
- Not added as test user → Add email to test users list
- Wrong Google account → Sign out and use correct account
- Cookies issue → Clear browser cookies for accounts.google.com

### "Redirect URI Mismatch"
- Check that redirect URI in Google Console matches exactly:
  - `http://localhost:3000/api/auth/callback/google` (for local)
  - Include both http and https versions
  - No trailing slashes

### "Scope Not Authorized"
- Gmail API not enabled → Enable it in API Library
- Scopes not added → Add required scopes in OAuth consent screen

## Security Note

For production:
- NEVER commit Google Client Secret to git
- Use environment variables only
- Rotate credentials if exposed
- Enable 2FA on Google Cloud account