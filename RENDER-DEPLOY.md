# Render Deployment - Unified Message Tracker

## 1. Push this project to GitHub
Do not commit your local `.env` file.

## 2. Create a Render Web Service
Connect the GitHub repository.

Build command:
`npm ci && npm run build`

Start command:
`npm start`

Health check path:
`/health`

## 3. Add Environment Variables in Render
Add these in Render > Service > Environment:

- `NODE_VERSION` = `20`
- `VITE_SUPABASE_URL` = your Supabase Project URL
- `VITE_SUPABASE_ANON_KEY` = your Supabase anon/public key
- `VITE_SUPABASE_PUBLISHABLE_KEY` = your Supabase publishable key (optional fallback if you use it)

Important: Vite variables are injected at BUILD time. After adding/changing them, use **Clear build cache & deploy**.

## 4. Supabase Authentication URL settings
In Supabase Dashboard > Authentication > URL Configuration:

- Site URL: `https://YOUR-RENDER-SERVICE.onrender.com`
- Redirect URLs: add `https://YOUR-RENDER-SERVICE.onrender.com/**`

Keep `http://localhost:5173/**` too if you also test locally.

## 5. Login user
The email must exist in Supabase Dashboard > Authentication > Users. If email confirmation is enabled, the user must be confirmed before password login works.

## 6. Render checks
After deploy:
- `/health` should return `{ "ok": true }`
- Home/login route should load.
- Refreshing a React route should still work because `server.mjs` falls back to `dist/index.html`.
