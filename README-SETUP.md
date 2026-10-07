# Unified Message Tracker - Setup

## 1. Requirements
- Node.js 20+
- npm
- Supabase project

## 2. Supabase database
Open Supabase Dashboard -> SQL Editor -> New query.
Paste and run `supabase/schema.sql`.

In Authentication -> URL Configuration set:
- Site URL: your Render URL after deploy
- Redirect URLs: add `http://localhost:5173/**` and `https://YOUR-RENDER-DOMAIN.onrender.com/**`

When email confirmation is enabled under Authentication -> Providers -> Email, new users must confirm their address before signing in. The signup page explains this and offers to resend the confirmation email; the login page also offers a resend action after a failed login.

## 3. Local environment
Copy `.env.example` to `.env` and add your real project URL and publishable key.

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

## 4. Run locally
```
npm install
npm run dev
```
Vite dev URL is normally http://localhost:5173

To test the production Node server:
```
npm run build
npm start
```
Open http://localhost:10000

## 5. Render hosting
Create a Web Service from the GitHub repository.
Use:
- Runtime: Node
- Build Command: `npm ci && npm run build`
- Start Command: `npm start`
- Health Check Path: `/health`

Add Render Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Important: Vite variables are compiled during the build, so after changing a VITE_* variable, redeploy/rebuild the Render service.
