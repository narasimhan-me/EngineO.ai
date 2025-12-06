# Stripe Setup & Integration Guide

**Version:** 1.0 — December 2025
**Phase:** BILLING-1

---

## Table of Contents

1. [Create Stripe Account](#1-create-stripe-account)
2. [Get API Keys](#2-get-api-keys)
3. [Create Products & Prices](#3-create-products--prices)
4. [Set Up Webhook Endpoint](#4-set-up-webhook-endpoint)
5. [Configure Environment Variables](#5-configure-environment-variables)
6. [Install Stripe CLI](#6-install-stripe-cli-local-development)
7. [Forward Webhooks Locally](#7-forward-webhooks-locally)
8. [Database Schema](#8-database-schema)
9. [Start the Application](#9-start-the-application)
10. [Test the Integration](#10-test-the-integration)
11. [Configure Customer Portal](#11-configure-customer-portal)
12. [Production Deployment](#12-production-deployment)
13. [Test Cards Reference](#13-test-cards-reference)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and click **Start now**
2. Enter your email and create a password
3. Complete account verification (can skip for test mode)
4. You'll land on the Dashboard in **Test Mode**

> **Note:** The toggle for Test/Live mode is in the top-right corner of the dashboard. Always use Test Mode during development.

---

## 2. Get API Keys

1. Navigate to **Developers → API Keys**
   Direct link: [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)

2. You'll see two keys:

| Key Type | Format | Usage |
|----------|--------|-------|
| Publishable key | `pk_test_...` | Frontend (not needed for BILLING-1) |
| Secret key | `sk_test_...` | Backend API calls |

3. Click **Reveal test key** next to the Secret key and copy it

> **Security:** Never commit your secret key to version control. Always use environment variables.

---

## 3. Create Products & Prices

### 3.1 Navigate to Products

Go to **Products** in the left sidebar, or visit [dashboard.stripe.com/test/products](https://dashboard.stripe.com/test/products)

### 3.2 Create Pro Plan

1. Click **+ Add product**
2. Fill in the details:
   - **Name:** `Pro`
   - **Description:** `5 projects, 500 crawled pages, 25 automation suggestions per day`
3. Under **Price information:**
   - **Pricing model:** Standard pricing
   - **Price:** `$29.00`
   - **Billing period:** `Monthly`
4. Click **Save product**
5. On the product page, find the Price section and copy the **Price ID** (e.g., `price_1ABC123...`)

### 3.3 Create Business Plan

1. Click **+ Add product** again
2. Fill in the details:
   - **Name:** `Business`
   - **Description:** `Unlimited projects, pages, and automation suggestions`
3. Under **Price information:**
   - **Pricing model:** Standard pricing
   - **Price:** `$99.00`
   - **Billing period:** `Monthly`
4. Click **Save product**
5. Copy the **Price ID**

### 3.4 Record Your Price IDs

You should now have two Price IDs:

```
STRIPE_PRICE_PRO=price_1ABC...
STRIPE_PRICE_BUSINESS=price_1DEF...
```

---

## 4. Set Up Webhook Endpoint

Webhooks allow Stripe to notify your application when events occur (e.g., successful payments, subscription changes).

### 4.1 For Local Development

Skip the dashboard webhook setup — we'll use Stripe CLI instead (see [Section 6](#6-install-stripe-cli-local-development)).

### 4.2 For Production

1. Go to **Developers → Webhooks**
   Direct link: [dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)

2. Click **+ Add endpoint**

3. Configure the endpoint:
   - **Endpoint URL:** `https://your-api-domain.com/billing/webhook`
   - **Description:** `EngineO.ai Billing Webhooks`

4. Under **Select events to listen to**, click **+ Select events** and choose:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

5. Click **Add endpoint**

6. On the endpoint page, click **Reveal** under Signing secret and copy the value (e.g., `whsec_...`)

---

## 5. Configure Environment Variables

Add the following to `apps/api/.env`:

```bash
# ===========================================
# STRIPE CONFIGURATION
# ===========================================

# Your Stripe Secret Key (starts with sk_test_ for test mode)
STRIPE_SECRET_KEY=sk_test_51ABC123...

# Webhook Signing Secret (starts with whsec_)
# For local dev: get from `stripe listen` command output
# For production: get from Stripe Dashboard webhook endpoint
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs for your subscription plans
STRIPE_PRICE_PRO=price_1ABC...
STRIPE_PRICE_BUSINESS=price_1DEF...

# Frontend URL (used for Stripe redirect URLs)
FRONTEND_URL=http://localhost:3000
```

### Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | API authentication | `sk_test_51ABC...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | `whsec_abc123...` |
| `STRIPE_PRICE_PRO` | Pro plan price ID | `price_1ABC...` |
| `STRIPE_PRICE_BUSINESS` | Business plan price ID | `price_1DEF...` |
| `FRONTEND_URL` | Redirect URL after checkout | `http://localhost:3000` |

---

## 6. Install Stripe CLI (Local Development)

The Stripe CLI allows you to forward webhook events to your local server.

### macOS (Homebrew)

```bash
brew install stripe/stripe-cli/stripe
```

### Windows (Scoop)

```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

### Windows (Chocolatey)

```bash
choco install stripe-cli
```

### Linux (Debian/Ubuntu)

```bash
# Add Stripe's GPG key
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg

# Add the repository
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee /etc/apt/sources.list.d/stripe.list

# Update and install
sudo apt update
sudo apt install stripe
```

### Docker

```bash
docker run --rm -it stripe/stripe-cli:latest
```

### Verify Installation

```bash
stripe --version
# Output: stripe version x.x.x
```

---

## 7. Forward Webhooks Locally

### 7.1 Login to Stripe CLI

```bash
stripe login
```

This opens your browser to authorize the CLI. Click **Allow access**.

### 7.2 Start Webhook Forwarding

Open a dedicated terminal and run:

```bash
stripe listen --forward-to localhost:3001/billing/webhook
```

You'll see output like:

```
> Ready! You are using Stripe API Version [2023-10-16].
> Your webhook signing secret is whsec_abc123def456...
```

### 7.3 Update Environment Variable

Copy the webhook signing secret and update your `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_abc123def456...
```

> **Important:** The signing secret changes each time you run `stripe listen`. For persistent testing, consider using the `--forward-connect-to` flag or setting up a proper webhook endpoint.

### 7.4 Keep Terminal Running

Leave this terminal running while developing. Webhook events will be logged here.

---

## 8. Database Schema

Ensure your Prisma schema includes Stripe fields. Check `apps/api/prisma/schema.prisma`:

```prisma
model Subscription {
  id                   String    @id @default(cuid())
  userId               String    @unique
  user                 User      @relation(fields: [userId], references: [id])
  plan                 String    @default("free")
  status               String    @default("active")
  stripeCustomerId     String?
  stripeSubscriptionId String?
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}
```

### Apply Schema Changes (if needed)

```bash
cd apps/api
npx prisma migrate dev --name add_stripe_fields
```

---

## 9. Start the Application

Open three terminal windows:

### Terminal 1: API Server

```bash
cd apps/api
pnpm start:dev
```

### Terminal 2: Web Frontend

```bash
cd apps/web
pnpm dev
```

### Terminal 3: Stripe Webhook Forwarding

```bash
stripe listen --forward-to localhost:3001/billing/webhook
```

---

## 10. Test the Integration

### 10.1 Open the Application

Navigate to [http://localhost:3000](http://localhost:3000)

### 10.2 Login or Register

Create a test account or login with existing credentials.

### 10.3 Navigate to Billing

Go to **Settings → Billing** or directly to [http://localhost:3000/settings/billing](http://localhost:3000/settings/billing)

### 10.4 Initiate Upgrade

Click **Upgrade** on the Pro or Business plan.

### 10.5 Complete Stripe Checkout

On the Stripe Checkout page, use test card details:

| Field | Value |
|-------|-------|
| Card number | `4242 4242 4242 4242` |
| Expiry | Any future date (e.g., `12/34`) |
| CVC | Any 3 digits (e.g., `123`) |
| ZIP | Any 5 digits (e.g., `12345`) |

### 10.6 Verify Success

After completing checkout:
- You should be redirected to `/settings/billing?success=true`
- A success message should appear
- Your plan should be updated to Pro or Business
- Check the Stripe CLI terminal for webhook events

---

## 11. Configure Customer Portal

The Stripe Customer Portal allows users to manage their subscriptions, update payment methods, and view invoices.

### 11.1 Access Portal Settings

Go to **Settings → Billing → Customer portal**
Direct link: [dashboard.stripe.com/test/settings/billing/portal](https://dashboard.stripe.com/test/settings/billing/portal)

### 11.2 Configure Features

Enable the following:

**Payment methods:**
- ✅ Allow customers to update payment methods

**Invoices:**
- ✅ Show invoice history

**Subscriptions:**
- ✅ Allow customers to cancel subscriptions
- ✅ Allow customers to switch plans (optional)

**Branding:**
- Add your logo and colors (optional)

### 11.3 Save Configuration

Click **Save** at the bottom of the page.

---

## 12. Production Deployment

### 12.1 Switch to Live Mode

1. Toggle from **Test** to **Live** mode in the Stripe Dashboard
2. Complete any required account verification

### 12.2 Create Live Products

Repeat [Section 3](#3-create-products--prices) in Live mode:
- Create Pro product with $29/month price
- Create Business product with $99/month price
- Copy the new Price IDs

### 12.3 Create Live Webhook Endpoint

Repeat [Section 4.2](#42-for-production) with your production URL.

### 12.4 Update Production Environment Variables

```bash
# Production Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...       # Live price ID
STRIPE_PRICE_BUSINESS=price_...  # Live price ID
FRONTEND_URL=https://your-production-domain.com
```

### 12.5 Deploy and Test

1. Deploy your application
2. Test with a real card (you can immediately refund)
3. Verify webhook events are received
4. Check subscription is created in database

---

## 13. Test Cards Reference

Use these card numbers in Test mode:

### Successful Payments

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Visa - Always succeeds |
| `5555 5555 5555 4444` | Mastercard - Always succeeds |
| `3782 822463 10005` | American Express - Always succeeds |

### Authentication Required

| Card Number | Description |
|-------------|-------------|
| `4000 0025 0000 3155` | Requires 3D Secure authentication |
| `4000 0027 6000 3184` | Requires authentication on all transactions |

### Declined Payments

| Card Number | Description |
|-------------|-------------|
| `4000 0000 0000 0002` | Generic decline |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 9987` | Lost card |
| `4000 0000 0000 9979` | Stolen card |
| `4100 0000 0000 0019` | Fraudulent card |

### Special Cases

| Card Number | Description |
|-------------|-------------|
| `4000 0000 0000 0341` | Attaching card to customer fails |
| `4000 0000 0000 3220` | 3D Secure 2 - always authenticated |

> **Note:** Use any future expiry date, any 3-digit CVC, and any 5-digit ZIP code.

---

## 14. Troubleshooting

### "Stripe is not configured" Error

**Cause:** `STRIPE_SECRET_KEY` is not set or invalid.

**Solution:**
1. Verify the key in your `.env` file
2. Restart the API server after changing `.env`
3. Check for typos or extra whitespace

### Webhook Events Not Received

**Cause:** Stripe CLI not running or wrong endpoint.

**Solution:**
```bash
# Verify Stripe CLI is running
stripe listen --forward-to localhost:3001/billing/webhook

# Test the endpoint manually
curl -X POST http://localhost:3001/billing/webhook -d "{}" -H "Content-Type: application/json"
```

### "Webhook signature verification failed" Error

**Cause:** Mismatched webhook signing secret.

**Solution:**
1. Copy the secret from `stripe listen` output
2. Update `STRIPE_WEBHOOK_SECRET` in `.env`
3. Restart the API server

### Checkout Redirects to Wrong URL

**Cause:** `FRONTEND_URL` is incorrect.

**Solution:**
1. Verify `FRONTEND_URL` in `.env`
2. For local: `http://localhost:3000`
3. For production: Your actual domain with `https://`

### Subscription Not Updated After Checkout

**Cause:** Webhook not processed successfully.

**Solution:**
1. Check Stripe CLI terminal for errors
2. Verify `checkout.session.completed` event is received
3. Check API logs for errors in webhook handler
4. Ensure `stripeCustomerId` is being saved

### "No Stripe customer found" for Billing Portal

**Cause:** User never created a Stripe customer.

**Solution:**
- User must complete at least one checkout to create a Stripe customer
- Or manually create a customer via the legacy `/billing/subscribe` endpoint

---

## Quick Reference

### Local Development URLs

| Service | URL |
|---------|-----|
| Web Frontend | http://localhost:3000 |
| API Backend | http://localhost:3001 |
| Billing Page | http://localhost:3000/settings/billing |
| Stripe Dashboard | https://dashboard.stripe.com/test |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/billing/plans` | List available plans |
| GET | `/billing/subscription` | Get user's subscription |
| GET | `/billing/entitlements` | Get user's limits and usage |
| POST | `/billing/create-checkout-session` | Start upgrade flow |
| POST | `/billing/create-portal-session` | Open billing portal |
| POST | `/billing/webhook` | Stripe webhook receiver |

### Plan IDs

| Plan | ID | Price |
|------|-------|-------|
| Free | `free` | $0/month |
| Pro | `pro` | $29/month |
| Business | `business` | $99/month |

---

## Support

- **Stripe Documentation:** [stripe.com/docs](https://stripe.com/docs)
- **Stripe CLI Reference:** [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
- **Webhook Events:** [stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)
- **Test Cards:** [stripe.com/docs/testing](https://stripe.com/docs/testing)
