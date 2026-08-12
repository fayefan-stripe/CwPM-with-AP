'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

interface SessionData {
  customerName: string
  customerEmail: string
  amountTotal: number
  currency: string
  paymentStatus: string
  invoiceUrl: string | null
  invoicePdf: string | null
  course: string
  term: string
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/get-session?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setSession(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [sessionId])

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(cents / 100)
  }

  return (
    <main className="min-h-screen bg-paragon-light">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-end">
          <span className="text-sm text-paragon-gray">Online Ordering</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {loading ? (
          <div className="text-center py-20">
            <svg className="animate-spin h-8 w-8 text-paragon-cyan mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-paragon-gray">Loading payment details...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-emerald-50 px-8 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-paragon-dark mb-1">Payment Successful</h1>
              <p className="text-paragon-gray">Your order has been confirmed</p>
            </div>

            {/* Details */}
            <div className="px-8 py-6">
              {session && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-paragon-gray mb-0.5">Customer</p>
                      <p className="font-medium text-paragon-dark">{session.customerName || 'Customer'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-paragon-gray mb-0.5">Product</p>
                      <p className="font-medium text-paragon-dark">{session.course}</p>
                    </div>
                    <div>
                      <p className="text-xs text-paragon-gray mb-0.5">Category</p>
                      <p className="font-medium text-paragon-dark">{session.term}</p>
                    </div>
                    <div>
                      <p className="text-xs text-paragon-gray mb-0.5">Amount Paid</p>
                      <p className="font-medium text-paragon-dark">{formatCurrency(session.amountTotal)}</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-semibold text-paragon-gray uppercase tracking-wider mb-4">What happens next</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-paragon-dark text-sm">Payment processed</p>
                          <p className="text-xs text-paragon-gray">Your payment has been successfully received</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-paragon-dark text-sm">Invoice generated</p>
                          <p className="text-xs text-paragon-gray">A paid invoice with surcharge line item has been created</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-paragon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-paragon-dark text-sm">Confirmation email sent</p>
                          <p className="text-xs text-paragon-gray">Check your inbox for the order confirmation and invoice</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Invoice links */}
                  {(session.invoiceUrl || session.invoicePdf) && (
                    <div className="border-t border-gray-100 pt-6 flex flex-wrap gap-3">
                      {session.invoiceUrl && (
                        <a
                          href={session.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-paragon-cyan hover:text-paragon-cyan-dark transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                          View Invoice
                        </a>
                      )}
                      {session.invoicePdf && (
                        <a
                          href={session.invoicePdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-paragon-cyan hover:text-paragon-cyan-dark transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                          Download PDF
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!session && !loading && (
                <div className="text-center py-8">
                  <p className="text-paragon-gray mb-4">Payment confirmed. Thank you for your order.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
              <Link
                href="/"
                className="text-sm font-medium text-paragon-cyan hover:text-paragon-cyan-dark transition-colors"
              >
                &larr; Back to Online Ordering
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-paragon-light flex items-center justify-center">
        <p className="text-paragon-gray">Loading...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
