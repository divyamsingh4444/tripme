# Turning on sign-in

TripME works completely without any of this. Trips are planned, saved and reopened with no account, and
that stays true — an account only carries your identity, not your trips.

Until you finish the steps below, the product hides the account control entirely and the `/signin` page
explains that sign-in is not configured. Nothing breaks and nothing looks broken.

**Time needed: about 20 minutes, all on free tiers.**

---

## 1 · Google OAuth credentials (required for sign-in at all)

1. Go to <https://console.cloud.google.com/> and create a project — any name.
2. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name `TripME`, your email for both support and developer contact
   - Scopes: leave the defaults (`email`, `profile`, `openid`)
   - Under **Test users**, add every Google account that will demo the product. While the app is in
     "Testing", only these accounts can sign in — this is the step people forget.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - **Authorised JavaScript origins:**
     - `http://localhost:3000`
     - `https://tripme-khaki.vercel.app`
   - **Authorised redirect URIs** — these must match exactly, including the path:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://tripme-khaki.vercel.app/api/auth/callback/google`
4. Copy the **Client ID** and **Client secret**.

## 2 · A session secret

Run this and copy the output:

```bash
npx auth secret
```

Or any 32+ character random string.

## 3 · Supabase (optional — only if you want accounts stored)

Without this, sign-in still works; sessions are signed cookies and no user record is kept anywhere.
With it, each person who signs in gets a row in your database.

1. Create a free project at <https://supabase.com/>.
2. **Project Settings → API**: copy the **Project URL** and the **`service_role` key**.
   The `service_role` key bypasses row-level security — it is a server-only secret. Never put it in
   client code, and never commit it.
3. **SQL Editor** → run this once, to create the schema Auth.js expects:

```sql
create schema if not exists next_auth;
grant usage on schema next_auth to service_role;
grant all on schema next_auth to postgres, service_role;

create table if not exists next_auth.users (
  id uuid not null default gen_random_uuid() primary key,
  name text,
  email text,
  "emailVerified" timestamp with time zone,
  image text,
  constraint email_unique unique (email)
);
grant all on table next_auth.users to postgres, service_role;

create table if not exists next_auth.accounts (
  id uuid not null default gen_random_uuid() primary key,
  type text not null,
  provider text not null,
  "providerAccountId" text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  oauth_token_secret text,
  oauth_token text,
  "userId" uuid references next_auth.users(id) on delete cascade,
  constraint provider_unique unique (provider, "providerAccountId")
);
grant all on table next_auth.accounts to postgres, service_role;

create table if not exists next_auth.sessions (
  id uuid not null default gen_random_uuid() primary key,
  expires timestamp with time zone not null,
  "sessionToken" text not null,
  "userId" uuid references next_auth.users(id) on delete cascade,
  constraint sessiontoken_unique unique ("sessionToken")
);
grant all on table next_auth.sessions to postgres, service_role;

create table if not exists next_auth.verification_tokens (
  identifier text,
  token text,
  expires timestamp with time zone not null,
  primary key (token),
  constraint token_identifier_unique unique (token, identifier)
);
grant all on table next_auth.verification_tokens to postgres, service_role;
```

4. **Project Settings → API → Exposed schemas**: add `next_auth`.

## 4 · The environment variables

Add to `.env.local` for local development — this file is gitignored and must stay that way:

```
AUTH_SECRET=<from step 2>
AUTH_GOOGLE_ID=<from step 1>
AUTH_GOOGLE_SECRET=<from step 1>

# Only if you did step 3
SUPABASE_URL=<your project URL>
SUPABASE_SERVICE_ROLE_KEY=<your service_role key>
```

Then the same values in **Vercel → your project → Settings → Environment Variables**, for Production
(and Preview if you use it).

Restart `pnpm dev` locally. On Vercel, redeploy.

---

## Checking it worked

- `/api/auth/providers` returns `{"google":{...}}` rather than `{}`.
- A **Sign in** link appears in the navigation.
- `/signin` shows the Google button instead of the "not configured" note.

The app asks that providers endpoint at runtime rather than reading the environment during the build.
That is deliberate: most pages here are statically prerendered, so a build-time check would freeze
whatever was true when the build ran, and adding credentials afterwards would leave the navigation
insisting sign-in was unavailable until someone thought to rebuild.

## If sign-in fails

| What you see | Almost always |
|---|---|
| `redirect_uri_mismatch` | The redirect URI in Google does not match **exactly** — check `https` vs `http`, a trailing slash, and that the path is `/api/auth/callback/google` |
| `access_denied` | The Google account is not in **Test users** while the consent screen is still in Testing |
| Signs in, then immediately signed out | `AUTH_SECRET` missing or different between environments |
| `Configuration` error | A Supabase variable is set but wrong, or the `next_auth` schema was never created |

## What is stored, and where

- **Google gives us** your name, email and profile picture. No password is involved — we never see one.
- **Supabase stores** that profile if you configured it. Nothing else.
- **Your trips stay in your browser.** They are not uploaded, not associated with your account, and not
  readable by us. Signing in does not currently sync them across devices — that would need trip storage
  to move server-side, which is a real design decision and not one to make quietly.
