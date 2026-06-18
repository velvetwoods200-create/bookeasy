# BookEasy — Appointment Booking SaaS

A complete, production-ready appointment booking platform for small businesses. Businesses get a public booking page where customers can book appointments 24/7, with email notifications and Stripe subscription billing.

---

## Features

- **Business dashboard** — manage all bookings, cancel appointments, view history
- **Public booking page** — customers pick service, date, time, enter details
- **Email notifications** — confirmation emails to customer + business, cancellation emails
- **Stripe subscription** — $9/month after 14-day free trial, managed via Stripe Checkout + portal
- **Working hours control** — set which days and hours you're available
- **Service management** — add/edit/delete services with duration and price
- **No double bookings** — slots that are taken are hidden automatically

---

## Prerequisites

You need:

1. **Node.js 18+** — download from [nodejs.org](https://nodejs.org)
2. **A Gmail account** with an App Password (see below)
3. **A Stripe account** (free to create at [stripe.com](https://stripe.com))

---

## Step-by-Step Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in each value (instructions for each below).

---

### 3. Set up Gmail App Password

Gmail requires an "App Password" — a special 16-character password just for apps.

1. Go to your [Google Account](https://myaccount.google.com)
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", click **2-Step Verification** and enable it
4. Go back to Security, scroll down to find **App passwords**
5. Select "Mail" and "Windows Computer" (or any device), click **Generate**
6. Copy the 16-character password shown
7. In `.env.local`:
   ```
   GMAIL_USER=your-gmail-address@gmail.com
   GMAIL_PASS=xxxx xxxx xxxx xxxx
   ```

---

### 4. Set up Stripe

#### Create a Stripe account

1. Sign up at [stripe.com](https://stripe.com)
2. Go to the **Dashboard**

#### Get your API keys

1. In the Stripe Dashboard, click **Developers** → **API keys**
2. Copy the **Publishable key** (starts with `pk_test_`) → paste as `STRIPE_PUBLISHABLE_KEY`
3. Copy the **Secret key** (starts with `sk_test_`) → paste as `STRIPE_SECRET_KEY`

#### Create the $9/month subscription product

1. In Stripe Dashboard, go to **Products** → **Add product**
2. Name it "BookEasy Pro" (or anything you like)
3. Set price: **$9.00 USD**, billing period: **Monthly**
4. Click **Save product**
5. On the product page, find the **Price ID** (starts with `price_`)
6. Paste it as `STRIPE_PRICE_ID` in `.env.local`

#### Set up the Stripe webhook (for local development)

1. Install the Stripe CLI from [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Log in:
   ```bash
   stripe login
   ```
3. Start the webhook listener (run this in a separate terminal):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the webhook signing secret shown (starts with `whsec_`)
5. Paste it as `STRIPE_WEBHOOK_SECRET` in `.env.local`

---

### 5. Generate NEXTAUTH_SECRET

Run this command and paste the output as `NEXTAUTH_SECRET`:

```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

### 6. Set the app URL

For local development:
```
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 7. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Using the App

1. Go to `/register` and create a business account
2. Go to `/dashboard/settings` and:
   - Set your business name and booking URL slug (e.g. `my-salon`)
   - Add at least one service (e.g. "Haircut", 30 minutes, $25)
   - Configure your working hours
3. Visit `http://localhost:3000/my-salon` to see your public booking page
4. Test a booking — you should receive confirmation emails

---

## Deploying to Vercel

> **Important:** SQLite stores data in a file on disk. Vercel's serverless functions use ephemeral storage, so **the database will be reset on each deployment**. For a real production app, replace `better-sqlite3` with [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), [Turso](https://turso.tech/), or [PlanetScale](https://planetscale.com/). For personal/small projects where you can redeploy rarely, SQLite on a single persistent server (like a VPS) works fine.

### Steps to deploy

1. Push your code to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. In the Vercel project settings, go to **Environment Variables** and add all variables from `.env.local`
4. Change `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your Vercel domain (e.g. `https://bookeasy.vercel.app`)
5. Deploy!

### Set up Stripe webhook on Vercel

1. In Stripe Dashboard, go to **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. Copy the **Signing secret** and update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables
6. Redeploy the project

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `NEXTAUTH_SECRET` | Random secret string (min 32 chars) for JWT signing |
| `NEXTAUTH_URL` | Full URL of your app (e.g. `https://yourapp.vercel.app`) |
| `GMAIL_USER` | Your Gmail address |
| `GMAIL_PASS` | Gmail App Password (16 chars, from Google Account settings) |
| `STRIPE_SECRET_KEY` | Stripe secret key (starts with `sk_`) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (starts with `pk_`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (starts with `whsec_`) |
| `STRIPE_PRICE_ID` | Price ID for the $9/month plan (starts with `price_`) |
| `NEXT_PUBLIC_APP_URL` | Full URL of your app (used in emails) |
| `DATABASE_URL` | Optional: custom path for SQLite file (default: `./data/bookeasy.db`) |

---

## Project Structure

```
bookeasy/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── register/page.tsx           # Business sign up
│   ├── login/page.tsx              # Business login
│   ├── dashboard/
│   │   ├── page.tsx                # Bookings dashboard
│   │   └── settings/page.tsx       # Services, hours, profile
│   ├── [username]/
│   │   ├── page.tsx                # Public booking page
│   │   ├── BookingForm.tsx         # Interactive booking flow
│   │   └── confirm/page.tsx        # Post-booking confirmation
│   └── api/
│       ├── auth/[...nextauth]/     # NextAuth handler
│       ├── register/               # Business registration
│       ├── bookings/               # Create/list/cancel bookings
│       ├── services/               # CRUD for services
│       ├── working-hours/          # CRUD for working hours
│       ├── availability/           # Available time slots
│       ├── business/[username]/    # Public business data
│       ├── profile/                # Update business profile
│       └── stripe/                 # Checkout, portal, webhook
├── components/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── CalendarPicker.tsx
│   ├── TimeSlotPicker.tsx
│   ├── Navbar.tsx
│   ├── DashboardNav.tsx
│   └── SessionProvider.tsx
├── lib/
│   ├── database.ts                 # SQLite setup & types
│   ├── auth.ts                     # NextAuth options
│   ├── email.ts                    # Nodemailer email templates
│   └── stripe.ts                   # Stripe helpers
├── types/
│   └── next-auth.d.ts              # Extended session types
├── middleware.ts                   # Protect /dashboard routes
├── .env.example                    # Environment variable template
└── README.md
```

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js v4 (Credentials provider)
- **Database:** SQLite via better-sqlite3
- **Email:** Nodemailer + Gmail SMTP
- **Payments:** Stripe (subscriptions + billing portal)
- **Deployment:** Vercel-ready
