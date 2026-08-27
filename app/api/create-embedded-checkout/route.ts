import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia' as any,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amount, courseName, customerEmail, customerId, surchargeAmount, surchargeLabel, returnPath } = body

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
      adaptive_pricing: { enabled: true },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}${returnPath || '/success'}?session_id={CHECKOUT_SESSION_ID}`,
    }

    const resolvedCustomerId = customerId || process.env.STRIPE_CUSTOMER_ID

    if (resolvedCustomerId) {
      sessionParams.customer = resolvedCustomerId
    } else {
      sessionParams.customer_email = customerEmail || 'demo@example.com'
    }

    const session = await (stripe as any).checkout.sessions.create(sessionParams)

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
    })
  } catch (error: any) {
    console.error('Stripe embedded checkout error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
