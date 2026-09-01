import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia' as any,
})

// Dedicated Checkout Session route for the /imagine page.
// Controls which payment methods appear in the Payment Element based on the
// customer's selection, without affecting the shared /events or /theconqueror flows.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      amount,
      courseName,
      customerEmail,
      customerId,
      surchargeAmount,
      surchargeLabel,
      returnPath,
      paymentMethod,
    } = body

    const lineItems: any[] = [
      {
        price_data: {
          unit_amount: amount,
          currency: 'aud',
          product_data: { name: courseName || 'IELTS Class' },
        },
        quantity: 1,
      },
    ]

    if (surchargeAmount && surchargeAmount > 0) {
      lineItems.push({
        price_data: {
          unit_amount: surchargeAmount,
          currency: 'aud',
          product_data: { name: surchargeLabel || 'Application Fee' },
        },
        quantity: 1,
      })
    }

    const sessionParams: Record<string, unknown> = {
      line_items: lineItems,
      mode: 'payment',
      ui_mode: 'elements',
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}${returnPath || '/success'}?session_id={CHECKOUT_SESSION_ID}`,
    }

    // Bank transfer requires a Customer on the session (not just an email),
    // so always resolve a customer for that flow.
    const resolvedCustomerId = customerId || process.env.STRIPE_CUSTOMER_ID

    if (paymentMethod === 'bank_transfer') {
      // Show only bank transfer.
      sessionParams.payment_method_types = ['customer_balance']
      sessionParams.payment_method_options = {
        customer_balance: {
          funding_type: 'bank_transfer',
          bank_transfer: { type: 'au_bank_transfer' },
        },
      }

      if (resolvedCustomerId) {
        sessionParams.customer = resolvedCustomerId
      }
    } else {
      // Cards (and other dynamic methods) — hide bank transfer.
      // Adaptive Pricing stays enabled for the card flow.
      sessionParams.adaptive_pricing = { enabled: true }
      sessionParams.excluded_payment_method_types = ['customer_balance']

      if (resolvedCustomerId) {
        sessionParams.customer = resolvedCustomerId
      } else {
        sessionParams.customer_email = customerEmail || 'demo@example.com'
      }
    }

    const session = await (stripe as any).checkout.sessions.create(sessionParams)

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
    })
  } catch (error: any) {
    console.error('Stripe imagine checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
