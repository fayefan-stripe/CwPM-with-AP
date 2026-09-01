'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { loadStripe } from '@stripe/stripe-js'

type PaymentMethodType = 'cards' | 'bank_transfer' | null

const PAYMENT_OPTIONS: { value: PaymentMethodType; label: string }[] = [
  { value: 'cards', label: 'Cards' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
]

const APPLICATION_FEE_AMOUNT = 500 // $5.00 AUD flat fee for card payments

const APPLICATION_FEE_CONFIG: Record<string, { amount: number; label: string }> = {
  cards: { amount: APPLICATION_FEE_AMOUNT, label: 'Application Fee' },
  bank_transfer: { amount: 0, label: '' },
}

const STEPS = [
  'Personal Details',
  'Academic Details',
  'Accommodation',
  'Airport Transfer Details',
  'Payment Methods',
  'Review',
]

const COURSE_AMOUNT = 245000

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
  stripeVersion: '2026-03-25.dahlia',
} as any)

export default function ImaginePage() {
  const [activeStep, setActiveStep] = useState(4)
  const [needPaymentPlan, setNeedPaymentPlan] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const checkoutRef = useRef<any>(null)
  const actionsRef = useRef<any>(null)
  const paymentElementRef = useRef<HTMLDivElement>(null)
  const currencyElementRef = useRef<HTMLDivElement>(null)
  const prevPaymentMethod = useRef<PaymentMethodType>(null)

  const applicationFee = paymentMethod ? APPLICATION_FEE_CONFIG[paymentMethod] : null
  const applicationFeeAmount = applicationFee?.amount ?? 0
  const totalAmount = COURSE_AMOUNT + applicationFeeAmount

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)

  const selectedLabel = paymentMethod
    ? PAYMENT_OPTIONS.find((o) => o.value === paymentMethod)?.label
    : 'Select payment method...'

  const initCheckout = useCallback(async (method: PaymentMethodType) => {
    if (!method) return
    setCheckoutLoading(true)
    setErrorMessage('')

    try {
      const config = APPLICATION_FEE_CONFIG[method]

      const res = await fetch('/api/imagine-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: COURSE_AMOUNT,
          courseName: 'IELTS Class',
          surchargeAmount: config.amount,
          surchargeLabel: config.label || undefined,
          paymentMethod: method,
        }),
      })

      const data = await res.json()
      if (data.error) {
        setErrorMessage(data.error)
        setCheckoutLoading(false)
        return
      }

      const stripe = await stripePromise
      if (!stripe) {
        setErrorMessage('Failed to load Stripe')
        setCheckoutLoading(false)
        return
      }

      if (paymentElementRef.current) paymentElementRef.current.innerHTML = ''
      if (currencyElementRef.current) currencyElementRef.current.innerHTML = ''

      const checkout = (stripe as any).initCheckoutElementsSdk({
        clientSecret: data.clientSecret,
        adaptivePricing: { allowed: true },
      })
      checkoutRef.current = checkout

      const loadResult = await checkout.loadActions()
      if (loadResult.type !== 'success') {
        setErrorMessage(loadResult.error?.message || 'Failed to load checkout actions')
        setCheckoutLoading(false)
        return
      }
      actionsRef.current = loadResult.actions

      const paymentElement = checkout.createPaymentElement()
      if (paymentElementRef.current) {
        paymentElement.mount(paymentElementRef.current)
      }

      try {
        const currencyElement = checkout.createCurrencySelectorElement()
        if (currencyElementRef.current) {
          currencyElement.mount(currencyElementRef.current)
        }
      } catch (e) {
        console.warn('Currency element not available:', e)
      }

      setCheckoutLoading(false)
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong')
      setCheckoutLoading(false)
    }
  }, [])

  useEffect(() => {
    if (paymentMethod && paymentMethod !== prevPaymentMethod.current) {
      prevPaymentMethod.current = paymentMethod
      initCheckout(paymentMethod)
    }
  }, [paymentMethod, initCheckout])

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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-paragon-navy text-white">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Image
            src="/paragoncare-logo.png"
            alt="Imagine Education"
            width={120}
            height={32}
            className="h-7 w-auto brightness-0 invert"
          />
          <div className="flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <span>Faye</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-52 bg-paragon-navy flex-shrink-0">
          <button className="w-full flex items-center gap-2 px-5 py-3 text-sm text-white bg-paragon-cyan hover:bg-paragon-cyan-dark transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Applications
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Application Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-base font-semibold text-paragon-dark">Application 9873</h1>
              <p className="text-sm text-paragon-cyan">Faye test</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-paragon-gray">Status</p>
              <p className="text-sm font-medium text-paragon-cyan">Draft</p>
            </div>
          </div>

          {/* Step Progress Bar */}
          <div className="flex mb-8">
            {STEPS.map((step, i) => {
              const isActive = i === activeStep
              const isPast = i < activeStep
              const isLast = i === STEPS.length - 1
              return (
                <div key={step} className="flex-1 relative">
                  <button
                    onClick={() => setActiveStep(i)}
                    className={`w-full py-2.5 px-3 text-xs font-medium text-center relative z-10 transition-colors ${
                      isActive
                        ? 'bg-paragon-cyan text-white'
                        : isPast
                        ? 'bg-paragon-navy text-white'
                        : 'bg-gray-300 text-gray-600'
                    } ${i === 0 ? 'rounded-l-md' : ''} ${isLast ? 'rounded-r-md' : ''}`}
                  >
                    {step}
                  </button>
                  {!isLast && (
                    <div
                      className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 w-0 h-0 border-t-[16px] border-t-transparent border-b-[16px] border-b-transparent border-l-[10px] ${
                        isActive
                          ? 'border-l-paragon-cyan'
                          : isPast
                          ? 'border-l-paragon-navy'
                          : 'border-l-gray-300'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Cyan separator line */}
          <div className="h-1 bg-gradient-to-r from-paragon-cyan to-paragon-cyan/60 rounded mb-8" />

          {/* Payment Methods Content */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 rounded bg-paragon-navy flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-paragon-dark">Payment Methods</h2>
            </div>

            <div className="border-t border-gray-200 pt-6">
              {/* Payment Plan Question */}
              <div className="mb-6">
                <label className="text-sm font-medium text-paragon-cyan mb-3 block">
                  Do you need a payment plan?*
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentPlan"
                      checked={needPaymentPlan}
                      onChange={() => setNeedPaymentPlan(true)}
                      className="w-4 h-4 text-paragon-navy accent-paragon-navy"
                    />
                    <span className="text-sm text-paragon-dark">Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentPlan"
                      checked={!needPaymentPlan}
                      onChange={() => setNeedPaymentPlan(false)}
                      className="w-4 h-4 text-paragon-navy accent-paragon-navy"
                    />
                    <span className="text-sm text-paragon-dark">No</span>
                  </label>
                </div>
              </div>

              {/* Payment Method Dropdown */}
              <div className="mb-6">
                <label className="text-sm font-medium text-paragon-cyan mb-3 block">
                  How are you paying for your fees?*
                </label>
                <div className="relative max-w-lg">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded text-sm text-paragon-dark bg-white hover:border-paragon-cyan transition-colors"
                  >
                    <span className={paymentMethod ? 'text-paragon-dark' : 'text-gray-400'}>
                      {selectedLabel}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-gray-200 rounded shadow-lg z-30">
                      {PAYMENT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setPaymentMethod(opt.value)
                            setDropdownOpen(false)
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-cyan-50 transition-colors ${
                            paymentMethod === opt.value
                              ? 'bg-cyan-50 text-paragon-cyan font-medium'
                              : 'text-paragon-dark'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Checkout area - shown after selecting a payment method */}
            {paymentMethod && (
              <div className="border-t border-gray-200 pt-6 mt-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Payment Element + Currency Selector */}
                  <div>
                    <h3 className="text-sm font-semibold text-paragon-gray uppercase tracking-wider mb-5">
                      Payment Details
                    </h3>

                    {checkoutLoading && (
                      <div className="flex items-center justify-center py-12">
                        <svg className="animate-spin h-6 w-6 text-paragon-cyan mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-sm text-paragon-gray">Loading payment form...</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit}>
                      {/* Currency Selector */}
                      <div ref={currencyElementRef} className="mb-4" />

                      {/* Payment Element */}
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
                          className="w-full mt-6 px-6 py-3 bg-paragon-cyan hover:bg-paragon-cyan-dark text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
                              Pay Now
                            </>
                          )}
                        </button>
                      )}
                    </form>

                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-paragon-gray">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Secured by Stripe
                    </div>
                  </div>

                  {/* Right: Order Summary */}
                  <div>
                    <h3 className="text-sm font-semibold text-paragon-gray uppercase tracking-wider mb-5">
                      Order Summary
                    </h3>

                    <div className="bg-paragon-light rounded-xl p-5">
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-paragon-dark text-sm">IELTS Class</p>
                          <p className="font-semibold text-paragon-dark">{formatCurrency(COURSE_AMOUNT)}</p>
                        </div>

                        {applicationFeeAmount > 0 ? (
                          <div className="flex justify-between items-start bg-amber-50 -mx-2 px-2 py-2 rounded-lg">
                            <div>
                              <p className="font-medium text-paragon-dark text-sm">
                                {applicationFee?.label}
                              </p>
                              <p className="text-xs text-paragon-gray">
                                Application Fee
                              </p>
                            </div>
                            <p className="font-semibold text-amber-700">{formatCurrency(applicationFeeAmount)}</p>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start bg-emerald-50 -mx-2 px-2 py-2 rounded-lg">
                            <p className="font-medium text-emerald-700 text-sm">No application fee applied</p>
                            <p className="font-semibold text-emerald-700">{formatCurrency(0)}</p>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-paragon-dark">Total</p>
                          <p className="text-2xl font-bold text-paragon-dark">{formatCurrency(totalAmount)}</p>
                        </div>
                        <p className="text-xs text-paragon-gray mt-1 text-right">AUD incl. GST + application fee</p>
                      </div>
                    </div>

                    <div className="mt-5 px-4 py-3 bg-cyan-50/50 border border-cyan-100 rounded-lg">
                      <p className="text-xs text-paragon-gray leading-relaxed">
                        A $5 AUD application fee applies when paying by card.
                        An invoice will be generated after payment with the application fee shown as a separate line item.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded transition-colors flex items-center gap-1"
            >
              &larr; PREVIOUS
            </button>
            {!paymentMethod && (
              <button
                onClick={() => setActiveStep(Math.min(STEPS.length - 1, activeStep + 1))}
                className="px-6 py-2.5 bg-paragon-cyan hover:bg-paragon-cyan-dark text-white text-sm font-medium rounded transition-colors flex items-center gap-1"
              >
                NEXT &rarr;
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
