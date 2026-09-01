'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'

const DEPOSIT_AMOUNT = 100000 // $1,000.00 AUD

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
  stripeVersion: '2026-03-25.dahlia',
} as any)

export default function EventsBookingPage() {
  const [bookingFor, setBookingFor] = useState('myself')
  const [email, setEmail] = useState('fayefan@stripe.com')
  const [checkoutLoading, setCheckoutLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const checkoutRef = useRef<any>(null)
  const actionsRef = useRef<any>(null)
  const paymentElementRef = useRef<HTMLDivElement>(null)
  const currencyElementRef = useRef<HTMLDivElement>(null)
  const paymentElementInstanceRef = useRef<any>(null)
  const currencyElementInstanceRef = useRef<any>(null)
  const currencyMountedRef = useRef(false)
  const initGenerationRef = useRef(0)

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)

  const destroyMountedElements = useCallback(() => {
    paymentElementInstanceRef.current?.destroy?.()
    currencyElementInstanceRef.current?.destroy?.()
    paymentElementInstanceRef.current = null
    currencyElementInstanceRef.current = null
    currencyMountedRef.current = false
    checkoutRef.current = null
    actionsRef.current = null
    if (paymentElementRef.current) paymentElementRef.current.replaceChildren()
    if (currencyElementRef.current) currencyElementRef.current.replaceChildren()
  }, [])

  useEffect(() => {
    const initGeneration = ++initGenerationRef.current
    let cancelled = false

    // Mount the Currency Selector above the Payment Element (Stripe best practice).
    // Guarded so it only mounts once, whether triggered on load or by a session change.
    const mountCurrencySelector = (checkout: any) => {
      if (currencyMountedRef.current) return
      try {
        const currencyElement = checkout.createCurrencySelectorElement()
        if (currencyElementRef.current) {
          currencyElement.mount(currencyElementRef.current)
          currencyElementInstanceRef.current = currencyElement
          currencyMountedRef.current = true
        }
      } catch (e) {
        console.warn('Currency selector not available:', e)
      }
    }

    async function initCheckout() {
      setCheckoutLoading(true)
      setErrorMessage('')
      destroyMountedElements()

      try {
        const res = await fetch('/api/create-embedded-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: DEPOSIT_AMOUNT,
            courseName: 'Booking Deposit — 6-Night Flight Package ex Melbourne',
            customerEmail: email,
            returnPath: '/success',
          }),
        })

        const data = await res.json()
        if (cancelled || initGeneration !== initGenerationRef.current) return
        if (data.error) {
          setErrorMessage(data.error)
          setCheckoutLoading(false)
          return
        }

        const stripe = await stripePromise
        if (cancelled || initGeneration !== initGenerationRef.current) return
        if (!stripe) {
          setErrorMessage('Failed to load Stripe')
          setCheckoutLoading(false)
          return
        }

        const checkout = (stripe as any).initCheckoutElementsSdk({
          clientSecret: data.clientSecret,
          adaptivePricing: { allowed: true },
        })
        checkoutRef.current = checkout

        // Adaptive Pricing may resolve the presentment currency asynchronously.
        // Mount the selector as soon as currencyOptions become available.
        checkout.on?.('change', (session: any) => {
          if (initGeneration !== initGenerationRef.current) return
          if (session?.currencyOptions?.length) {
            mountCurrencySelector(checkout)
          }
        })

        const loadResult = await checkout.loadActions()
        if (cancelled || initGeneration !== initGenerationRef.current) return
        if (loadResult.type !== 'success') {
          setErrorMessage(loadResult.error?.message || 'Failed to load checkout actions')
          setCheckoutLoading(false)
          return
        }
        actionsRef.current = loadResult.actions

        mountCurrencySelector(checkout)

        const paymentElement = checkout.createPaymentElement()
        if (paymentElementRef.current) {
          paymentElement.mount(paymentElementRef.current)
          paymentElementInstanceRef.current = paymentElement
        }

        if (cancelled || initGeneration !== initGenerationRef.current) return
        setCheckoutLoading(false)
      } catch (err: any) {
        if (cancelled) return
        setErrorMessage(err.message || 'Something went wrong')
        setCheckoutLoading(false)
      }
    }

    const debounce = setTimeout(initCheckout, 300)

    return () => {
      cancelled = true
      clearTimeout(debounce)
      destroyMountedElements()
    }
  }, [email, destroyMountedElements])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!actionsRef.current) return
    setSubmitting(true)
    setErrorMessage('')

    try {
      const result = await actionsRef.current.confirm()
      if (result.error) {
        setErrorMessage(result.error.message)
        setSubmitting(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment failed')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/events" className="text-lg font-bold tracking-tight text-gray-900">
            EVENTS TRAVEL
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
          {/* Main Content */}
          <div>
            <p className="text-xs font-semibold text-gray-400 tracking-widest mb-3">BOOKING REQUEST</p>
            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
              Start your <span className="text-[#0066FF]">journey.</span>
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-xl">
              Complete the form below — one of our travel experts will confirm availability,
              pricing, and next steps, typically within one business day.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700 mb-4">
              <span className="flex items-center gap-1.5">
                <CheckIcon /> Est. 1993
              </span>
              <span className="flex items-center gap-1.5">
                <CheckIcon /> Guaranteed official tickets
              </span>
              <span className="flex items-center gap-1.5">
                <CheckIcon /> Trusted by 250,000+ travellers
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-8">
              See over 700 reviews on <span className="font-semibold text-[#00B67A]">Trustpilot</span>
            </p>

            {/* Info banner */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-8">
              <svg className="w-5 h-5 text-[#0066FF] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-700">
                A {formatCurrency(DEPOSIT_AMOUNT)} deposit is required to secure your booking.
                The remaining balance will be invoiced once confirmed by our travel experts.
              </p>
            </div>

            {/* Step 1 — Your details */}
            <div className="border border-gray-200 rounded-xl p-6 md:p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-medium text-gray-900">Step 1 of 3 — Your details</p>
                <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-[#0066FF] rounded-full" />
                </div>
              </div>

              <fieldset className="mb-8">
                <legend className="text-sm font-medium text-gray-900 mb-4">
                  Who is this booking request for?
                </legend>
                <div className="space-y-3">
                  {[
                    { value: 'myself', label: 'Myself — I am the lead traveller' },
                    { value: 'someone_else', label: 'Someone else — I am booking but not travelling myself' },
                    { value: 'agent', label: 'Someone else — I am a travel agent, advisor or corporate booker' },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="bookingFor"
                        value={opt.value}
                        checked={bookingFor === opt.value}
                        onChange={() => setBookingFor(opt.value)}
                        className="mt-0.5 w-4 h-4 accent-[#0066FF]"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <p className="text-sm font-semibold text-[#0066FF] mb-4">Your details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="First name" required defaultValue="Faye" />
                <FormField label="Last name" required defaultValue="Fan" />
                <FormField label="Email" required type="email" value={email} onChange={setEmail} />
                <FormField label="Phone" required defaultValue="0400000000" />
              </div>
            </div>

            {/* Step 3 — Payment */}
            <div className="border border-gray-200 rounded-xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-medium text-gray-900">Step 3 of 3 — Pay deposit</p>
                <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-[#0066FF] rounded-full" />
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Secure your booking with a {formatCurrency(DEPOSIT_AMOUNT)} deposit. Choose your preferred
                currency below — the final amount will be converted at checkout.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Element + Currency Selector */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Payment Details
                  </h3>

                  {checkoutLoading && (
                    <div className="flex items-center justify-center py-12">
                      <svg className="animate-spin h-6 w-6 text-[#0066FF] mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm text-gray-500">Loading payment form...</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div ref={currencyElementRef} className="mb-4 min-h-[44px]" />
                    <div ref={paymentElementRef} className="min-h-[200px]" />

                    {errorMessage && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{errorMessage}</p>
                      </div>
                    )}

                    {!checkoutLoading && (
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-6 px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm font-semibold rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Pay {formatCurrency(DEPOSIT_AMOUNT)} Deposit
                          </>
                        )}
                      </button>
                    )}
                  </form>

                  <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secured by Stripe
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Order Summary
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-5">
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">6-Night Flight Package</p>
                          <p className="text-xs text-gray-500">ex Melbourne — Booking Deposit</p>
                        </div>
                        <p className="font-semibold text-gray-900">{formatCurrency(DEPOSIT_AMOUNT)}</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-900">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(DEPOSIT_AMOUNT)}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-right">AUD incl. GST</p>
                    </div>
                  </div>
                  <div className="mt-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Your deposit secures your place on the package. The remaining balance will be
                      invoiced once your booking is confirmed by our travel experts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="border border-gray-200 rounded-xl p-5">
              <p className="font-semibold text-gray-900 mb-2">Need help?</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Talk to an expert on{' '}
                <a href="tel:+61359897666" className="text-[#0066FF] hover:underline">
                  +613 5989 7666
                </a>{' '}
                or email{' '}
                <a href="mailto:res@events.com.au" className="text-[#0066FF] hover:underline">
                  res@events.com.au
                </a>{' '}
                — we&apos;re ready!
              </p>
              <div className="mt-4 w-10 h-10 rounded-full bg-[#0066FF] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Accepted currencies
              </p>
              <div className="flex flex-wrap gap-2">
                {['AUD', 'USD', 'GBP', 'EUR', 'NZD'].map((c) => (
                  <span key={c} className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4 items-center opacity-60">
              <div className="text-xs font-bold text-gray-500 border border-gray-300 px-3 py-2 rounded">IATA</div>
              <div className="text-xs font-bold text-gray-500 border border-gray-300 px-3 py-2 rounded">ATIA</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function FormField({
  label,
  required,
  defaultValue,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  required?: boolean
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  type?: string
}) {
  const controlled = onChange
    ? { value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value) }
    : { defaultValue }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        {...controlled}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
      />
    </div>
  )
}
