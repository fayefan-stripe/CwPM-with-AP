# Contour Education — Student Payment Portal with Surcharging

A student payment portal showing per-brand surcharging using Stripe Checkout Sessions.

Students select a course, choose a payment method, and the appropriate surcharge is applied automatically. After payment, an invoice is generated with the surcharge shown as a separate line item.

## Surcharge Rates

| Payment Method     | Surcharge |
|--------------------|-----------|
| Visa / Mastercard  | 1.5%      |
| American Express   | 2.1%      |
| BECS Direct Debit  | None      |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Stripe keys

Open `.env.local` and replace the placeholder values with your Stripe test keys.

You can find your keys at: https://dashboard.stripe.com/test/apikeys

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run the app

```bash
npm run dev
```

Open http://localhost:3000

## Test Payment Methods

| Method     | Card Number            | Details                       |
|------------|------------------------|-------------------------------|
| Visa       | `4242 4242 4242 4242`  | Any future date, any CVC      |
| Mastercard | `5555 5555 5555 4444`  | Any future date, any CVC      |
| Amex       | `3782 822463 10005`    | Any future date, any CVC      |
| BECS       | BSB `000-000`          | Account `000123456`, any name |

## How It Works

1. Student selects a course program and payment method
2. A Stripe Checkout Session is created with:
   - Course fee and surcharge as **separate line items**
   - Card brand restrictions (`brands_blocked`) to enforce the selected brand
   - `invoice_creation` enabled for automatic invoice generation
3. Student pays on the Stripe-hosted checkout page
4. A paid invoice is generated with the surcharge as a visible line item

## Key Stripe API Features

- [`Checkout Sessions`](https://docs.stripe.com/api/checkout/sessions/create) — Stripe-hosted payment page
- [`brands_blocked`](https://docs.stripe.com/api/checkout/sessions/create#create_checkout_session-payment_method_options-card-restrictions-brands_blocked) — restricts which card brands can be used
- [`invoice_creation`](https://docs.stripe.com/api/checkout/sessions/create#create_checkout_session-invoice_creation) — auto-generates a paid invoice after payment

## Customisation

To adjust surcharge rates, edit the `PAYMENT_CONFIG` object in `app/api/create-checkout-session/route.ts`.

To adjust the UI payment method options and labels, edit the `SURCHARGE_INFO` object in `app/page.tsx`.
