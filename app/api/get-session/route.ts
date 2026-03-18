import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['invoice', 'customer'],
    })

    const invoice = session.invoice as Stripe.Invoice | null
    const customer = session.customer as Stripe.Customer | null

    return NextResponse.json({
      customerName: customer?.name || session.customer_details?.name || 'Student',
      customerEmail: customer?.email || session.customer_details?.email || '',
      amountTotal: session.amount_total || 0,
      currency: session.currency || 'aud',
      paymentStatus: session.payment_status,
      invoiceUrl: invoice?.hosted_invoice_url || null,
      invoicePdf: invoice?.invoice_pdf || null,
      course: session.metadata?.course || '',
      term: session.metadata?.term || '',
    })
  } catch (error: any) {
    console.error('Stripe error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
