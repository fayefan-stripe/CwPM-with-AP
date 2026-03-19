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

### Prerequisites

You need **Node.js** (v18 or later) installed. npm is included with Node. If you don't have it, download from [nodejs.org](https://nodejs.org/).

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Stripe keys

Create a `.env.local` file in the project root (you can copy from `.env.example`). Add your Stripe test keys:

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

## What happens when you click "Pay now"

When the student clicks **Pay now**, the app calls Stripe's **Checkout Sessions API** to create a one-off payment session. Here's what that call does in simple terms.

### Checkout Session

We ask Stripe to create a **Checkout Session**. Stripe returns a link to its own hosted payment page. The student is redirected there to enter card or bank details. We never see or handle their payment details—Stripe does that securely.

```typescript
const session = await stripe.checkout.sessions.create(params)
return NextResponse.json({ url: session.url })
```

The front end then redirects the student to `session.url` (Stripe's hosted page).

### Restricting the payment page

So the student only sees the option they chose (and the right surcharge applies), we send two things:

- **Payment method type** — We tell Stripe which payment methods to show: either "card" (credit/debit) or "BECS Direct Debit". So if they chose bank transfer, only the bank form appears; if they chose card, only the card form appears.
- **Card brand (for cards only)** — When they chose "Visa / Mastercard" we tell Stripe to block American Express on the hosted page. When they chose "American Express" we tell Stripe to block Visa, Mastercard and Discover. That way they can't use the wrong card type by mistake. Stripe calls this **brands_blocked**.

**Payment method type** is set on the session (from our config: card only, Amex only, or BECS only):

```typescript
payment_method_types: config.paymentMethodTypes,  // e.g. ['card'] or ['au_becs_debit']
```

**Card brand restriction** is set via `payment_method_options` when the student chose a card option:

```typescript
params.payment_method_options = {
  card: {
    restrictions: {
      brands_blocked: config.brandsBlocked,  // e.g. ['american_express'] or ['visa', 'mastercard', 'discover_global_network']
    },
  },
}
```

### Invoice creation

We turn on **automatic invoice creation** for the session. That means:

- As soon as the payment succeeds, Stripe creates a **paid invoice** (no extra step).
- The invoice has two line items: the course fee and the surcharge (when applicable).
- We send through a short description, a footer ("Thank you for choosing Contour Education…"), and custom fields (e.g. Student ID, Term) so the invoice is ready to use or send to the student.

We enable this by passing `invoice_creation` when creating the Checkout Session:

```typescript
invoice_creation: {
  enabled: true,
  invoice_data: {
    description: `${course} - ${term} Class Fees`,
    footer: 'Thank you for choosing Contour Education. Surcharge applied per payment method selected.',
    metadata: { student_id, student_name, term, course, payment_method_type, surcharge_rate, surcharge_amount },
    custom_fields: [
      { name: 'Student ID', value: studentId },
      { name: 'Term', value: term },
    ],
  },
},
```

So in one flow: Pay now → Stripe checkout (restricted to the chosen method and card brand) → payment → invoice created automatically with surcharge visible.

## Key Stripe API Features

- [`Checkout Sessions`](https://docs.stripe.com/api/checkout/sessions/create) — Stripe-hosted payment page
- [`brands_blocked`](https://docs.stripe.com/api/checkout/sessions/create#create_checkout_session-payment_method_options-card-restrictions-brands_blocked) — restricts which card brands can be used
- [`invoice_creation`](https://docs.stripe.com/api/checkout/sessions/create#create_checkout_session-invoice_creation) — auto-generates a paid invoice after payment

## Customisation

To adjust surcharge rates, edit the `PAYMENT_CONFIG` object in `app/api/create-checkout-session/route.ts`.

To adjust the UI payment method options and labels, edit the `SURCHARGE_INFO` object in `app/page.tsx`.
