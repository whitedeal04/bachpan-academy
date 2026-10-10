# Bachpan Academy — dynamic website starter

This is a redesigned public website plus a password-protected owner dashboard. It is a starter project based on the recovered saved homepage; it does not contain the original deployed logo or campus image files, so the hero illustration is CSS-built for now.

## Important deployment detail

Your current Cloudflare Pages project was deployed by direct asset upload. **Pages Functions need a supported project deployment workflow**; to use this backend, deploy this folder using Wrangler or connect a Git repository to Pages. Do not overwrite the existing live site until the new deployment has been tested.

## What's included

- Public responsive homepage and programs/facilities
- Admission inquiry form backed by Cloudflare D1
- Dynamic public notices
- Owner login and admin dashboard
- Create/delete notices, review admission inquiries and update inquiry status
- Editable school introduction/contact fields stored in D1
- API validation, same-origin checks, HttpOnly/Secure/SameSite session cookie, HMAC-signed 8-hour session

## Prerequisites

- Node.js and npm installed
- A Cloudflare account
- Wrangler CLI: `npm install -g wrangler`
- Login: `npx wrangler login`

## 1. Create the D1 database

From this project folder:

```bash
npx wrangler d1 create bachpanacademy-db
```

Cloudflare prints a database ID. Replace `REPLACE_WITH_YOUR_D1_DATABASE_ID` in `wrangler.toml` with that exact ID.

Initialize the database:

```bash
npx wrangler d1 execute bachpanacademy-db --remote --file=./schema.sql
```

## 2. Configure secrets

Use a long, unique admin password. Generate a random session secret (at least 32 random bytes). Set both as Cloudflare secrets:

```bash
npx wrangler pages secret put ADMIN_PASSWORD --project-name bachpanacademy
npx wrangler pages secret put SESSION_SECRET --project-name bachpanacademy
```

When prompted, enter the values. Do not put secrets in this repository, HTML, JavaScript, or screenshots. Keep them private. If you change the Pages project name, use the actual project name in the command.

For local development only, create `.dev.vars` with:

```text
ADMIN_PASSWORD="a-long-unique-password"
SESSION_SECRET="a-long-random-secret-at-least-32-random-bytes"
```

Never commit `.dev.vars`.

## 3. Test locally

```bash
npx wrangler pages dev .
```

Open the local URL shown in the terminal. Test `/`, `/admin/`, a notice publish/delete, and an admission inquiry. Do not use real student details during testing.

## 4. Deploy

Test first, then deploy this folder to the existing project name:

```bash
npx wrangler pages deploy . --project-name bachpanacademy
```

This publishes a new deployment. Verify it before treating it as production. If you want a Git-based workflow, create a private GitHub repository, push this project, and connect that repository in Cloudflare Pages; use an appropriate build output directory and ensure Functions are included. Avoid deploying `recovered-original.html` to production; it is only retained as a recovery reference and includes browser-save noise.

## Admin

Visit `/admin/`. The first admin is configured using the `ADMIN_PASSWORD` secret. This starter uses one shared owner password (no user accounts or password reset workflow). Use a strong unique password and do not share it. The session expires after 8 hours.

## Current limitations / before public launch

- Hero introduction and footer contact details are wired to the settings database. The footer shows phone/email/address when the owner fills those fields.
- Photo upload management is not included yet; the hero is an illustration. Add Cloudflare R2 with authenticated upload endpoints before implementing gallery uploads.
- Add rate limiting / Turnstile to the admission form and login before a high-traffic public launch.
- Establish a retention policy and restrict access to admission inquiries because they contain personal information. Avoid storing sensitive student records here.
- Configure a custom domain only if you own it; it is optional.
- Google Fonts are loaded externally; use system fonts or self-host fonts if required.
