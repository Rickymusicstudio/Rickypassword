# Admin setup (one time, ~10 minutes)

The admin at **rickypassword.com/admin** lets you add and edit **songs (MP3 + cover)**,
**news articles (with photos)** and **gallery photos**. Changes show on the site right away;
no redeploy needed. Content and uploads live in a free Supabase project.

## 1. Create the Supabase project
1. Go to <https://supabase.com>, sign in, **New project** (any name, e.g. `rickypassword`;
   region close to Rwanda, e.g. *Frankfurt* or *Cape Town*).
2. When it's ready: **SQL Editor → New query**, paste the whole of
   [`supabase/schema.sql`](supabase/schema.sql), and **replace `CHANGE-ME@example.com`**
   at the bottom with the email you will log in with. Click **Run**.

## 2. Create your admin login
1. **Authentication → Users → Add user → Create new user**: same email as above, a strong
   password, tick *Auto Confirm User*.
2. **Authentication → Sign In / Providers → Email**: turn **off** “Allow new users to sign up”
   (so nobody else can create an account).

## 3. Connect the website
From **Project Settings → API** copy the *Project URL* and the *anon public* key.

- **Vercel** → your project → *Settings → Environment Variables*, add for Production and Preview:
  - `VITE_SUPABASE_URL` = Project URL
  - `VITE_SUPABASE_ANON_KEY` = anon public key

  Then redeploy once (Deployments → ⋯ → Redeploy).
- **Your computer** (for local testing): copy `frontend/.env.example` to `frontend/.env.local`
  and fill in the same two values.

## 4. Import the existing songs, articles and photos (optional but recommended)
Add the *service_role* key (Project Settings → API) to `frontend/.env.local` as
`SUPABASE_SERVICE_ROLE_KEY=…` (keep this one secret; never put it in Vercel), then:

```bash
cd frontend
node --env-file=.env.local tools/import-content.mjs
```

Safe to run again; it updates instead of duplicating. The old MP3s and photos stay in
`frontend/public/` and keep working; only new uploads go to Supabase Storage.

## Using the admin
- Go to **/admin**, sign in.
- **Music**: *+ New song* → title, release date, upload MP3 and cover. Untick *Published* to hide a song.
  For a video-only song, tick *YouTube only* and paste the link.
- **News**: *+ New article* → title (the link is made automatically), summary, story
  (empty line between paragraphs), cover photo, extra photos. Untick *Published* to save as a draft.
- **Gallery**: drag photos onto the box (several at once). Click a caption to edit it.

Photos are resized automatically before upload. MP3s can be up to 50 MB.
WhatsApp/Facebook previews of new articles use the cover photo and summary.
