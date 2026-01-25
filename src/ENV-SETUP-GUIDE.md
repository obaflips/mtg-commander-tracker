# Environment Variables Setup

The app now uses environment variables for Airtable credentials instead of hardcoding them. This makes it more secure for deployment.

## Local Development Setup

1. **Create `.env.local` file** in your project root (if it doesn't exist already):

```bash
touch .env.local
```

2. **Add your Airtable credentials:**

```
VITE_AIRTABLE_TOKEN=your_token_here
VITE_BASE_ID=your_base_id_here
```

3. **Make sure `.env.local` is in your `.gitignore`:**

```bash
echo ".env.local" >> .gitignore
```

4. **Restart your dev server:**

```bash
npm run dev
```

## Vercel Deployment Setup

1. **Go to your Vercel dashboard**
2. **Click on your project**
3. **Go to Settings → Environment Variables**
4. **Add these two variables:**

   - **Name:** `VITE_AIRTABLE_TOKEN`
   - **Value:** Your Airtable Personal Access Token
   - **Environment:** Production, Preview, Development (check all)

   - **Name:** `VITE_BASE_ID`
   - **Value:** Your Airtable Base ID
   - **Environment:** Production, Preview, Development (check all)

5. **Redeploy** (or push a new commit to trigger deployment)

## How It Works

The `import.meta.env.VITE_*` variables are replaced at build time by Vite. They're accessible in your frontend code but the actual values come from:

- **Local:** `.env.local` file
- **Vercel:** Environment variables you set in the dashboard

## Security Note

These variables are still exposed in the frontend (browser can see them). This is normal for API keys that are meant to be used client-side. Make sure your Airtable Personal Access Token is:

1. Scoped to only the permissions you need (data.records:read and data.records:write)
2. Only has access to your MTG Commander base
3. Has a descriptive name so you can revoke it later if needed
