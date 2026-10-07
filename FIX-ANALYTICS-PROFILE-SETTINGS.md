# Analytics / Profile / Settings fix

## What was fixed
- Analytics no longer stays forever on Loading when one Supabase query fails.
- Profile data queries use independent fallbacks.
- Existing authenticated users with no `profiles` row are auto-created on demand.
- Profile and Settings no longer stay permanently on a loading screen when profile data is missing.
- Settings now shows save errors instead of silently failing.

## Required Supabase repair for existing users
Run `supabase/profile-repair.sql` once in Supabase Dashboard > SQL Editor.

Then redeploy on Render using Clear build cache & deploy.
