# Local VS Code login check

1. Open the `project` folder in VS Code.
2. Confirm `.env` is in the same folder as `package.json`.
3. Run `npm install`.
4. Stop any old Vite process and run `npm run dev`.
5. Open the exact localhost URL printed by Vite.
6. In Supabase Dashboard -> Authentication -> Users, confirm the email account exists and is confirmed.
7. In Supabase Dashboard -> Authentication -> URL Configuration, add `http://localhost:5173` to Redirect URLs (and Site URL while testing locally if needed).
8. If login still fails, open browser DevTools -> Console. The app now prints the exact Supabase sign-in error.

Important: after changing `.env`, Vite must be restarted.
