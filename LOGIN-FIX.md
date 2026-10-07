# Login Fix Checklist

## Code fixes included
- Login now trims/lowercases email.
- Successful `signInWithPassword()` immediately stores the returned Supabase session/user.
- Successful login explicitly navigates to `/dashboard`.
- Signup confirmation redirect points to `/dashboard`.
- Clearer login errors for invalid credentials/email confirmation.

## Supabase Dashboard settings
1. Authentication -> Providers -> Email: make sure Email provider is enabled.
2. Authentication -> URL Configuration:
   - Site URL: your Render URL (or `http://localhost:5173` for local testing)
   - Redirect URLs: add `http://localhost:5173/**` and your Render URL with `/**`.
3. Authentication -> Users: verify the account exists.
4. If Confirm email is enabled, confirm the signup email before login. For quick development testing, you can disable Confirm email, then create a fresh test user.
5. SQL Editor: run `supabase/schema.sql` once.

## Local run
npm install
npm run dev

## Render
Build command: npm ci && npm run build
Start command: npm start
Environment variables:
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY
After changing any VITE_* variable, redeploy with a fresh build.
