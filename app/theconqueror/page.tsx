'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { loadStripe } from '@stripe/stripe-js'

const BUNDLE_AMOUNT = 38849
const BUNDLE_ORIGINAL = 51793
const BUNDLE_WITH_APPAREL_AMOUNT = 41449
const BUNDLE_WITH_APPAREL_ORIGINAL = 55292
const SHIPPING_AMOUNT = 6949
const BASE_AMOUNT = BUNDLE_AMOUNT + SHIPPING_AMOUNT

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

let checkoutSessionPromise: Promise<{ clientSecret: string; sessionId: string }> | null = null

function fetchCheckoutSession() {
  if (!checkoutSessionPromise) {
    checkoutSessionPromise = fetch('/api/create-embedded-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: BASE_AMOUNT,
        courseName: 'Harry Potter Virtual Challenge Bundle',
        returnPath: '/theconqueror',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        return { clientSecret: data.clientSecret, sessionId: data.sessionId }
      })
      .catch((err) => {
        checkoutSessionPromise = null
        throw err
      })
  }
  return checkoutSessionPromise
}

function ConquerorLogo() {
  return (
    <Image
      src="/theconqueror-logo.png"
      alt="The Conqueror"
      width={220}
      height={48}
      className="h-10 w-auto"
      priority
    />
  )
}

export default function TheConquerorPage() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [addonAdded, setAddonAdded] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const actionsRef = useRef<any>(null)
  const checkoutRef = useRef<any>(null)
  const paymentElementRef = useRef<HTMLDivElement>(null)
  const currencyElementRef = useRef<HTMLDivElement>(null)
  const paymentElementInstanceRef = useRef<any>(null)
  const currencyElementInstanceRef = useRef<any>(null)
  const initGenerationRef = useRef(0)

  const totalAmount = BASE_AMOUNT

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)

  const destroyMountedElements = useCallback(() => {
    paymentElementInstanceRef.current?.destroy?.()
    currencyElementInstanceRef.current?.destroy?.()
    paymentElementInstanceRef.current = null
    currencyElementInstanceRef.current = null
    checkoutRef.current = null
    actionsRef.current = null
    if (paymentElementRef.current) paymentElementRef.current.replaceChildren()
    if (currencyElementRef.current) currencyElementRef.current.replaceChildren()
  }, [])

  useEffect(() => {
    const initGeneration = ++initGenerationRef.current
    let cancelled = false

    async function initCheckout() {
      setCheckoutLoading(true)
      setErrorMessage('')
      destroyMountedElements()

      try {
        const data = await fetchCheckoutSession()
        if (cancelled || initGeneration !== initGenerationRef.current) return

        const stripe = await stripePromise
        if (!stripe) {
          setErrorMessage('Failed to load Stripe')
          setCheckoutLoading(false)
          return
        }
        if (initGeneration !== initGenerationRef.current) return

        const checkout = (stripe as any).initCheckoutElementsSdk({
          clientSecret: data.clientSecret,
          adaptivePricing: { allowed: true },
        })
        checkoutRef.current = checkout

        const loadResult = await checkout.loadActions()
        if (initGeneration !== initGenerationRef.current) return
        if (loadResult.type !== 'success') {
          setErrorMessage(loadResult.error?.message || 'Failed to load checkout actions')
          setCheckoutLoading(false)
          return
        }
        actionsRef.current = loadResult.actions

        try {
          const currencyElement = checkout.createCurrencySelectorElement()
          if (currencyElementRef.current) {
            currencyElement.mount(currencyElementRef.current)
            currencyElementInstanceRef.current = currencyElement
          }
        } catch (e) {
          console.warn('Currency selector not available:', e)
        }

        const paymentElement = checkout.createPaymentElement({
          layout: { type: 'tabs' },
        })
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

    initCheckout()

    return () => {
      cancelled = true
      destroyMountedElements()
    }
  }, [destroyMountedElements])

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
    <div className="min-h-screen bg-conqueror-bg">
      {/* Header */}
      <header
        className="relative bg-conqueror-header overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 80% 20%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(ellipse at top, #1a2a4a 0%, #0a1628 70%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 pt-6 pb-20">
          <ConquerorLogo />
          <h1 className="mt-6 text-3xl md:text-4xl font-bold text-white">
            Sign up for Harry Potter Bundle
          </h1>
        </div>
      </header>

      {/* Main two-column layout */}
      <div className="max-w-6xl mx-auto px-6 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Your details — overlaps banner */}
            <div className="bg-white rounded-lg shadow-lg p-6 relative z-20 -mt-10 lg:-mt-14">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Your details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-conqueror-green/30 focus:border-conqueror-green"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">First name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-conqueror-green/30 focus:border-conqueror-green"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Last name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-conqueror-green/30 focus:border-conqueror-green"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Payment</h2>

              <div className="border-2 border-conqueror-green/30 rounded-lg p-5">
                {checkoutLoading && (
                  <div className="flex items-center justify-center py-10">
                    <svg className="animate-spin h-6 w-6 text-conqueror-green mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm text-gray-500">Loading payment form...</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className={checkoutLoading ? 'hidden' : undefined}>
                  <div ref={currencyElementRef} className="mb-4 min-h-[44px]" />
                  <div ref={paymentElementRef} className="min-h-[180px]" />

                  {errorMessage && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    </div>
                  )}

                  {!checkoutLoading && (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full mt-6 py-3.5 bg-[#1a9c40] hover:bg-[#157a33] text-white font-bold text-base rounded-md transition-colors disabled:opacity-50 border-0 cursor-pointer"
                    >
                      {submitting ? 'Processing...' : 'Place Order Now'}
                    </button>
                  )}
                </form>

                <p className="mt-3 text-center text-xs text-blue-600 flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure, fast checkout with Link
                </p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { icon: '🛡️', text: 'We protect & respect your privacy' },
                { icon: '🔒', text: 'Your information is secure' },
                { icon: '🏅', text: 'Award winning service' },
              ].map((badge) => (
                <div key={badge.text} className="flex flex-col items-center gap-2 px-2">
                  <span className="text-2xl">{badge.icon}</span>
                  <p className="text-xs text-gray-500 leading-snug">{badge.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Hero product image */}
            <div className="relative -mt-20 lg:-mt-28 mb-2">
              <Image
                src="/theconqueror-product.png"
                alt="Harry Potter Virtual Challenge medals"
                width={500}
                height={400}
                className="w-full h-auto"
                priority
              />
            </div>

            {/* Your products */}
            <div>
              <h3 className="text-base font-bold text-gray-900">Your products</h3>
              <p className="text-xs text-gray-500 mb-3">Select one</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="border-2 border-conqueror-green rounded-lg p-3 bg-white relative overflow-hidden">
                  <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-conqueror-green flex items-center justify-center z-10">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <Image
                    src="/theconqueror-product-left.png"
                    alt="Harry Potter Virtual Challenge Bundle medals"
                    width={200}
                    height={120}
                    className="w-full h-24 object-cover object-center rounded mb-2"
                  />
                  <div>
                    <p className="text-xs text-gray-400 line-through">{formatCurrency(BUNDLE_ORIGINAL)}</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(BUNDLE_AMOUNT)}</p>
                    <p className="text-xs text-gray-600 mt-1 leading-snug">
                      Harry Potter Virtual Challenge Bundle | 7x Entry + 7x Medal
                    </p>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-3 bg-white opacity-60 overflow-hidden">
                  <Image
                    src="/theconqueror-product-right.png"
                    alt="Harry Potter bundle with apparel"
                    width={200}
                    height={120}
                    className="w-full h-24 object-cover object-center rounded mb-2"
                  />
                  <div>
                    <p className="text-xs text-gray-400 line-through">{formatCurrency(BUNDLE_WITH_APPAREL_ORIGINAL)}</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(BUNDLE_WITH_APPAREL_AMOUNT)}</p>
                    <p className="text-xs text-gray-600 mt-1 leading-snug">
                      Harry Potter Virtual Challenge Bundle | 7x Entry + 7x Medal + 1X Apparel
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Addon */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center text-2xl flex-shrink-0">
                🏅
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">1x Harry Potter Medal Hanger</p>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(5999)}</p>
              </div>
              <button
                type="button"
                onClick={() => setAddonAdded(!addonAdded)}
                className={`px-4 py-1.5 text-sm font-medium rounded border transition-colors flex-shrink-0 ${
                  addonAdded
                    ? 'bg-conqueror-green text-white border-conqueror-green'
                    : 'bg-yellow-50 text-amber-700 border-amber-300 hover:bg-yellow-100'
                }`}
              >
                {addonAdded ? 'Added' : 'Add to order'}
              </button>
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-900 mb-4">Order summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="text-gray-800">Harry Potter Virtual Challenge Bundle</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button type="button" className="w-6 h-6 border border-gray-300 rounded text-gray-500 text-xs">−</button>
                      <span className="text-gray-700">1</span>
                      <button type="button" className="w-6 h-6 border border-gray-300 rounded text-gray-500 text-xs">+</button>
                    </div>
                    <p className="text-xs text-red-500 mt-1">Save AUD $129.44 (25%)</p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrency(BUNDLE_AMOUNT)}</p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-gray-800">Shipping</p>
                    <p className="text-xs text-gray-500">Global tracked shipping</p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrency(SHIPPING_AMOUNT)}</p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <p className="font-bold text-gray-900 text-base">Total</p>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 line-through">{formatCurrency(58742)}</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer support */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <p className="font-semibold text-gray-800 mb-1">Email support</p>
            <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
              support@example.com
            </a>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-1">Chat with us</p>
            <p>Use the chat widget in the bottom right corner</p>
          </div>
        </div>
      </div>
    </div>
  )
}
