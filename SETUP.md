# Aurelia — going live

Before, every product lived in the browser of the person who added it. Now the products live in one shared database (Supabase), so every visitor sees the same catalog.

```
  Shoppers ──read──►┐
                    │   Supabase (database + image storage)
  Owner ──sign in──►┤   rules: everyone can READ,
   (admin panel)    │          only listed admins can WRITE
                    ▼
               Vercel hosts the site
```

## 1. Create the database (≈5 min, free)
1. Go to https://supabase.com and sign up. Create a **New project** (the region closest to Bangladesh is Singapore). Save the database password somewhere safe.
2. Open **SQL Editor → New query**, paste everything from `supabase/schema.sql`, and click **Run**.
3. Open a new query, paste `supabase/seed.sql`, and click **Run**. This loads the 38 starter products. Run it only once.

## 2. Create the owner's login
1. Go to **Authentication → Users → Add user → Create new user**. Enter your friend's email and a strong password, and tick **Auto Confirm User**.
2. In **SQL Editor**, run this with her email:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'her-email@example.com';
   ```
3. Go to **Authentication → Sign In / Providers** and turn **off** "Allow new users to sign up". Even with sign-ups on, a stranger still couldn't edit anything, because they wouldn't be on the admins list. Turning it off just keeps the user list clean.

## 3. Connect the site
1. In Supabase, open **Project Settings → API** and copy the **Project URL** and the **anon public** key.
2. **On your computer:** copy `.env.example` to `.env.local` and paste both values in. Then run `npm install` and `npm run dev`.
3. **On Vercel:** open the project (`aurelia-store`) → **Settings → Environment Variables** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Redeploy. Either push to GitHub (if the Vercel project is linked to the repo) or run `npx vercel --prod` in this folder.

Never put the **service_role** key anywhere in this project. Only the anon key belongs here.

## 4. Using the admin panel
- Open `your-site.vercel.app/#admin`, or click the small "admin portal" link in the footer.
- Sign in with the owner email and password. You stay signed in on that device until you click **Sign out**.
- Product changes and image uploads (max 3 MB) go live for everyone straight away.

## Good to know
- If a free Supabase project gets no traffic for about a week, it pauses. Click **Restore** in the dashboard to bring it back. A live shop usually gets enough visits to stay awake.
- Checkout is still a placeholder. The cart works, but orders don't go anywhere yet.
