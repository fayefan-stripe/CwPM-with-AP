import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Surcharge rates and brand restrictions by payment method selection
const PAYMENT_CONFIG: Record<string, {
  rate: number
  surchargeLabel: string
  paymentMethodTypes: string[]
  brandsBlocked?: string[]
}> = {
  card_standard: {
    rate: 0.015,
    surchargeLabel: 'Card Payment Surcharge (1.5%)',
    paymentMethodTypes: ['card'],
    // Block Amex so only Visa/MC/etc. can be used
    brandsBlocked: ['american_express'],
  },
  card_amex: {
    rate: 0.021,
    surchargeLabel: 'American Express Surcharge (2.1%)',
    paymentMethodTypes: ['card'],
    // Block everything except Amex
    brandsBlocked: ['visa', 'mastercard', 'discover_global_network'],
  },
  au_becs_debit: {
    rate: 0,
    surchargeLabel: '',
    paymentMethodTypes: ['au_becs_debit'],
  },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { studentId, studentName, studentEmail, term, course, amount, paymentMethod } = body

    const config = PAYMENT_CONFIG[paymentMethod]
    if (!config) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }

    const surchargeAmount = Math.round(amount * config.rate)

    // Build line items — only include surcharge if rate > 0
    const lineItems: any[] = [
      {
        price_data: {
          currency: 'aud',
          product_data: {
            name: `${course} - ${term} Class Fees`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ]

    if (surchargeAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'aud',
          product_data: {
            name: config.surchargeLabel,
          },
          unit_amount: surchargeAmount,
        },
        quantity: 1,
      })
    }

    // Build Checkout Session params
    const params: any = {
      mode: 'payment',
      line_items: lineItems,
      // Generate invoice after successful payment — surcharge appears as separate line item
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `${course} - ${term} Class Fees`,
          footer: 'Thank you for choosing ParagonCare Direct. Surcharge applied per payment method selected.',
          metadata: {
            student_id: studentId,
            student_name: studentName,
            term: term,
            course: course,
            payment_method_type: paymentMethod,
            surcharge_rate: String(config.rate),
            surcharge_amount: String(surchargeAmount),
          },
          custom_fields: [
            { name: 'Student ID', value: studentId },
            { name: 'Term', value: term },
          ],
        },
      },
      customer_email: studentEmail,
      payment_method_types: config.paymentMethodTypes,
      billing_address_collection: 'required',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.NEXT_PUBLIC_APP_URL,
      metadata: {
        student_id: studentId,
        student_name: studentName,
        term: term,
        course: course,
        payment_method_type: paymentMethod,
      },
    }

    // Add brand restrictions for card payments
    if (config.brandsBlocked && config.brandsBlocked.length > 0) {
      params.payment_method_options = {
        card: {
          restrictions: {
            brands_blocked: config.brandsBlocked,
          },
        },
      }
    }

    const session = await stripe.checkout.sessions.create(params)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
