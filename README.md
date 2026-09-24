
# MISI STORE

MISI STORE is a second-hand shop for carefully selected clothing, accessories, and everyday finds. The storefront is built with Next.js and uses Supabase for product data, image storage, and order processing.

## Features

### GitHub Actions deployment

The workflow in `.github/workflows/deploy.yml` runs on pushes to `main` and can also be started manually from the GitHub Actions tab. It installs dependencies, runs lint, and deploys the production project through Vercel.

Add these GitHub repository secrets before pushing to `main`:

| Secret | Value |
| --- | --- |
| `VERCEL_TOKEN` | A Vercel personal access token. |
| `VERCEL_ORG_ID` | The Vercel team or account ID. |
| `VERCEL_PROJECT_ID` | The Vercel project ID. |

Set the application environment variables in Vercel under the project settings. They are not supplied by the GitHub workflow.

Fill in the values in `.env.local`. Never commit that file or expose the Supabase service-role key in browser code.

Run the SQL schema in the Supabase SQL Editor:

```text
supabase/schema.sql
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin dashboard is available at [http://localhost:3000/admin](http://localhost:3000/admin).

## Environment variables

The complete list is available in `.env.example`.

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL used by server-side admin/database access. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase service-role key. Keep it secret. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase project URL for client/deployment configuration. |
| `APP_URL` | Public app URL used when building order confirmation links. |
| `RESEND_API_KEY` | Resend API key used to send order emails. |
| `ORDER_FROM_EMAIL` | Sender address for order confirmation emails. |
| `ADMIN_EMAIL` | Admin login email. |
| `ADMIN_PASSWORD` | Admin login password. Use a strong password in production. |
| `ADMIN_SESSION_SECRET` | Long random secret used to sign the admin session cookie. |
| `INSTAGRAM_ACCOUNT_ID` | Instagram Business account ID for product import. |
| `INSTAGRAM_ACCESS_TOKEN` | Instagram Graph API token for product import. |

For local development, `APP_URL` should normally be `http://localhost:3000`. In production, it must match the deployed site URL.

## Product and order data

The schema in `supabase/schema.sql` creates and configures:

- `categories` for the catalogue categories.
- `products` for product details, availability, prices, sizes, and image URLs.
- `orders` and `order_items` for checkout data.
- `create_order` and `confirm_order` functions for validated order creation and confirmation.
- The public `misi-store-images` storage bucket for product images.

Products are marked unavailable after an order is confirmed. Prices are entered and displayed as whole denar amounts in the UI; the existing `price_cents` column stores that numeric value for compatibility.

## Useful commands

```bash
npm run dev       # Start the development server
npm run lint      # Run ESLint
npx tsc --noEmit  # Run TypeScript checks
npm run build     # Create a production build
npm start         # Serve the production build
```

## Project structure

```text
app/                    Next.js routes and pages
app/api/                API and admin route handlers
app/product/[id]/       Dynamic product detail page
lib/                    Supabase, product, auth, email, and import helpers
public/                 Static assets
supabase/schema.sql     Database, storage, policies, and order functions
```

## Deployment

The app can be deployed to any platform that supports Next.js 16. Configure every production variable from `.env.example` in the hosting provider, especially `APP_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SESSION_SECRET`, and the email settings.

Before deploying, run:

```bash
npm run lint
npm run build
```

Do not commit `.env.local`, service-role keys, API tokens, or production admin credentials.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
