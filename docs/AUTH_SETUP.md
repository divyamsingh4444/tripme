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

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

> `npx auth secret` is the documented command everywhere else and it crashes on this machine —
> its prompt library needs Node ≥ 20.12 and we are on 20.10. That is a CLI paper cut, not an
> Auth.js problem, and Node 20.10 runs Next 16 fine (`engines: >=20.9.0`). The line above does the
> same job with no dependencies.

Any 32+ character random string works.

## 3 · Supabase (optional — only if you want accounts stored)

Without this, sign-in still works; sessions are signed cookies and no user record is kept anywhere.
With it, each person who signs in gets a row in your database.

> **Ignore Supabase's own "Connect to your project" quickstart.** It offers `@supabase/ssr`, browser
> clients, middleware and a `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. TripME needs none of that — the
> Auth.js adapter talks to Supabase server-side only. Following that quickstart is the fastest way to
> end up with the wrong key in the wrong variable. There is also no need to link a GitHub repo when
> creating the project; this repo has no `supabase/migrations` directory and no reason for one.

1. Create a free project at <https://supabase.com/>.
2. Copy two values. **The dashboard has moved these — the older docs you will find elsewhere are wrong:**
   - **Project URL** — *Settings → Data API*.
   - **Secret key** — *Settings → API Keys → **Secret keys*** tab. It starts `sb_secret_…`. (The
     legacy `service_role` JWT lives on a separate tab and also works; either is the same privilege.)

   **Take the secret key, never the publishable one.** This key bypasses row-level security: it is a
   server-only credential, it must never carry a `NEXT_PUBLIC_` prefix, and it must never be committed.
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

4. Expose the schema: **Settings → Data API → Settings** tab → **Exposed schemas** → add `next_auth`,
   then **press Save at the bottom of that card.**

   > The dropdown does not save on its own. Ticking `next_auth` and navigating away looks identical to
   > having done it, and produces a sign-in that gets all the way through Google and then fails with
   > `error=Configuration`. This cost more time than every other step combined. The real error only
   > appears in `.next/dev/logs/next-development.log`:
   > `PGRST106 Invalid schema: next_auth — Only the following schemas are exposed: public, graphql_public`.

## 4 · The environment variables

Add to `.env.local` for local development — this file is gitignored and must stay that way:

```
AUTH_SECRET=<from step 2>
AUTH_GOOGLE_ID=<from step 1>
AUTH_GOOGLE_SECRET=<from step 1>

# Only if you did step 3
SUPABASE_URL=<your project URL>
SUPABASE_SERVICE_ROLE_KEY=<the sb_secret_… key from step 3>
```

**Replace every placeholder.** Leaving `<from step 1>` in place produces `Error 401: invalid_client`
from Google, which reads like a credentials problem and is really a copy-paste one.

Then the same values in **Vercel → your project → Settings → Environment Variables**, for Production
(and Preview if you use it).

Restart the dev server locally. On Vercel, redeploy.

> **It must be port 3000.** The redirect URI registered with Google is exact. If something is already
> holding 3000, Next quietly starts on 3001 and every sign-in fails. Ctrl+C does not always release it —
> find the process with `netstat -ano | findstr :3000` and `taskkill /PID <pid> /F`.
>
> **If `pnpm dev` will not run at all** on Windows — "running scripts is disabled on this system" — that
> is PowerShell's execution policy blocking pnpm's unsigned `.ps1` wrapper. Use `pnpm.cmd dev`, or fix it
> permanently with `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

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

**Read the server log, not the browser.** Auth.js deliberately shows the browser almost nothing —
`error=Configuration` covers every server-side cause. What actually failed is in
`.next/dev/logs/next-development.log` locally, or the Vercel runtime logs in production. Every entry
below was diagnosed there.

| What you see | Almost always |
|---|---|
| `Error 401: invalid_client` | The `AUTH_GOOGLE_*` values are still the placeholders from step 4, or the client secret was truncated on paste |
| `redirect_uri_mismatch` | The redirect URI in Google does not match **exactly** — check `https` vs `http`, a trailing slash, the path `/api/auth/callback/google`, and that you are really on port 3000 |
| `access_denied` | The Google account is not in **Test users** while the consent screen is still in Testing |
| Signs in, then immediately signed out | `AUTH_SECRET` missing, or different between environments |
| `error=Configuration` **after** Google succeeded | Look for `PGRST106 Invalid schema: next_auth` in the log — the schema exists but was never *saved* as exposed (step 3.4). If instead the log shows a connection or key error, a Supabase variable is wrong, most often the publishable key used in place of the secret one |
| Hydration mismatch warning on load | `data-gr-ext-installed` / `data-new-gr-c-s-check-loaded` in the message means Grammarly, not this app. Browser extensions write to `<body>` before React hydrates; `<body>` carries a shallow `suppressHydrationWarning` for exactly this |

## Rotating a secret

Do this the moment a key is pasted into a chat, a screenshot, a shared document or a commit — treat
exposure as compromise, not as a risk to weigh up. Rotation is cheap; all four take about ten minutes.

| Secret | Where |
|---|---|
| `AUTH_GOOGLE_SECRET` | Google Cloud → Credentials → your OAuth client → **Add secret**, then delete the old one. The **client ID does not change**, so sign-in keeps working throughout |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API Keys → **New secret key**, then revoke the old |
| `GROQ_API_KEY` | <https://console.groq.com/keys> → new key, delete the old |
| `AUTH_SECRET` | Regenerate with the command in step 2. This **signs everyone out** — harmless here, everyone signs in again |

Update `.env.local` **and** Vercel, then redeploy. Generate the new value in your own terminal and paste
it straight into the file: do not print a secret into a chat window, which is how the last one leaked.

Finally, delete the `client_secret_….json` that Google Cloud downloads — it usually sits forgotten in
`~/Downloads` and contains the secret you just rotated away from.

## What is stored, and where

- **Google gives us** your name, email and profile picture. No password is involved — we never see one.
- **Supabase stores** that profile if you configured it. Nothing else.
- **Your trips stay in your browser.** They are not uploaded, not associated with your account, and not
  readable by us. Signing in does not currently sync them across devices — that would need trip storage
  to move server-side, which is a real design decision and not one to make quietly.
