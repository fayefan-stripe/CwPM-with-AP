'use client'

import { useState } from 'react'
import Image from 'next/image'

type PaymentMethodType = 'card_standard' | 'card_amex' | 'au_becs_debit'

const SURCHARGE_INFO: Record<PaymentMethodType, { rate: number; label: string; description: string }> = {
  card_standard: { rate: 0.015, label: 'Card Surcharge (1.5%)', description: 'Visa, Mastercard' },
  card_amex: { rate: 0.021, label: 'Amex Surcharge (2.1%)', description: 'American Express' },
  au_becs_debit: { rate: 0, label: '', description: 'Australian bank account' },
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card_standard')
  const [customerName, setCustomerName] = useState('Brighton Medical Centre')
  const [customerEmail, setCustomerEmail] = useState('customer@example.com')
  const [accountNumber, setAccountNumber] = useState('ACC-78432')

  const products = [
    {
      name: 'Dental Instruments Kit',
      category: 'Dental',
      description: 'Professional dental examination & treatment instruments',
      sku: 'DEN-2026-PRO',
      amount: 245000,
      units: 1,
    },
    {
      name: 'Diagnostic Imaging Supplies',
      category: 'Medical Imaging',
      description: 'Ultrasound gel, imaging paper & accessories bundle',
      sku: 'IMG-2026-BDL',
      amount: 189500,
      units: 1,
    },
    {
      name: 'Surgical Consumables Pack',
      category: 'Medical Devices',
      description: 'Sterile surgical gloves, drapes & suture kits',
      sku: 'SUR-2026-CSM',
      amount: 312000,
      units: 1,
    },
  ]

  const selected = products[selectedProduct]
  const surchargeRate = SURCHARGE_INFO[paymentMethod].rate
  const surchargeAmount = Math.round(selected.amount * surchargeRate)
  const totalAmount = selected.amount + surchargeAmount

  const handlePayment = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: accountNumber || 'N/A',
          studentName: customerName,
          studentEmail: customerEmail,
          term: selected.category,
          course: selected.name,
          amount: selected.amount,
          paymentMethod,
        }),
      })

      const data = await response.json()

      if (data.error) {
        console.error('Server error:', data.error)
        setLoading(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(cents / 100)
  }

  return (
    <main className="min-h-screen bg-paragon-light">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Image
            src="/paragoncare-logo.png"
            alt="ParagonCare"
            width={180}
            height={40}
            className="h-8 w-auto"
          />
          <span className="text-sm text-paragon-gray">Online Ordering</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-paragon-dark tracking-tight">
            Online Ordering Portal
          </h1>
          <p className="text-paragon-gray mt-1">
            Place your order for medical supplies and equipment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Cards */}
            <div>
              <h2 className="text-sm font-semibold text-paragon-gray uppercase tracking-wider mb-4">
                Select a Product
              </h2>
              <div className="space-y-3">
                {products.map((product, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedProduct(index)}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                      selectedProduct === index
                        ? 'border-paragon-cyan bg-white shadow-md'
                        : 'border-transparent bg-white/60 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-paragon-dark">{product.name}</h3>
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-cyan-50 text-paragon-cyan">
                            {product.category}
                          </span>
                        </div>
                        <p className="text-sm text-paragon-gray">{product.description}</p>
                        <p className="text-sm text-paragon-gray mt-0.5">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-paragon-dark">{formatCurrency(product.amount)}</p>
                        <p className="text-xs text-paragon-gray">ex. GST</p>
                      </div>
                    </div>
                    {selectedProduct === index && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-paragon-cyan flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-paragon-cyan">Selected</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <h2 className="text-sm font-semibold text-paragon-gray uppercase tracking-wider mb-4">
                Select Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Visa / Mastercard */}
                <button
                  onClick={() => setPaymentMethod('card_standard')}
                  className={`p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                    paymentMethod === 'card_standard'
                      ? 'border-paragon-cyan bg-white shadow-md'
                      : 'border-transparent bg-white/60 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-paragon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-paragon-dark text-sm">Visa / Mastercard</h3>
                      <p className="text-xs text-paragon-gray">Credit or debit</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-paragon-gray">Surcharge</span>
                    <span className={`text-xs font-semibold ${paymentMethod === 'card_standard' ? 'text-paragon-cyan' : 'text-paragon-gray'}`}>
                      1.5%
                    </span>
                  </div>
                </button>

                {/* American Express */}
                <button
                  onClick={() => setPaymentMethod('card_amex')}
                  className={`p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                    paymentMethod === 'card_amex'
                      ? 'border-paragon-cyan bg-white shadow-md'
                      : 'border-transparent bg-white/60 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <span className="text-indigo-600 font-bold text-xs">AMEX</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-paragon-dark text-sm">American Express</h3>
                      <p className="text-xs text-paragon-gray">Credit card</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-paragon-gray">Surcharge</span>
                    <span className={`text-xs font-semibold ${paymentMethod === 'card_amex' ? 'text-paragon-cyan' : 'text-paragon-gray'}`}>
                      2.1%
                    </span>
                  </div>
                </button>

                {/* BECS Direct Debit */}
                <button
                  onClick={() => setPaymentMethod('au_becs_debit')}
                  className={`p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                    paymentMethod === 'au_becs_debit'
                      ? 'border-paragon-cyan bg-white shadow-md'
                      : 'border-transparent bg-white/60 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-paragon-dark text-sm">Bank Transfer</h3>
                      <p className="text-xs text-paragon-gray">BECS Direct Debit</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-paragon-gray">Surcharge</span>
                    <span className="text-xs font-semibold text-emerald-600">
                      No surcharge
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-sm font-semibold text-paragon-gray uppercase tracking-wider mb-4">
                Customer Details
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-medium text-paragon-gray mb-1.5 block">Business / Full Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Brighton Medical Centre"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-paragon-dark placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-paragon-cyan/20 focus:border-paragon-cyan transition-all"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-medium text-paragon-gray mb-1.5 block">Email *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. customer@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-paragon-dark placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-paragon-cyan/20 focus:border-paragon-cyan transition-all"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-medium text-paragon-gray mb-1.5 block">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. ACC-78432"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-paragon-dark placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-paragon-cyan/20 focus:border-paragon-cyan transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-16">
              <div className="p-6">
                <h2 className="text-sm font-semibold text-paragon-gray uppercase tracking-wider mb-5">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-4">
                  {/* Product line item */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-paragon-dark text-sm">{selected.name}</p>
                      <p className="text-xs text-paragon-gray">{selected.category}</p>
                    </div>
                    <p className="font-semibold text-paragon-dark ml-4">{formatCurrency(selected.amount)}</p>
                  </div>

                  {/* Surcharge line item */}
                  {surchargeAmount > 0 ? (
                    <div className="flex justify-between items-start bg-amber-50 -mx-3 px-3 py-2 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-paragon-dark text-sm">
                          {SURCHARGE_INFO[paymentMethod].description} Surcharge
                        </p>
                        <p className="text-xs text-paragon-gray">
                          {(surchargeRate * 100).toFixed(1)}% of order total
                        </p>
                      </div>
                      <p className="font-semibold text-amber-700 ml-4">{formatCurrency(surchargeAmount)}</p>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start bg-emerald-50 -mx-3 px-3 py-2 rounded-lg">
                      <p className="font-medium text-emerald-700 text-sm">No surcharge applied</p>
                      <p className="font-semibold text-emerald-700 ml-4">{formatCurrency(0)}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-paragon-dark">Total</p>
                    <p className="text-2xl font-bold text-paragon-dark">{formatCurrency(totalAmount)}</p>
                  </div>
                  <p className="text-xs text-paragon-gray mt-1 text-right">AUD incl. GST + surcharge</p>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading || !customerName.trim() || !customerEmail.trim()}
                  className="w-full btn-primary py-4 rounded-xl text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Pay Now'
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-paragon-gray">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secured by Stripe
                </div>
              </div>

              <div className="px-6 py-4 bg-cyan-50/50 border-t border-cyan-100">
                <p className="text-xs text-paragon-gray leading-relaxed">
                  A surcharge applies based on your selected payment method.
                  An invoice will be generated after payment with the surcharge shown as a separate line item.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-paragon-light-dark bg-white/40">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image
            src="/paragoncare-logo.png"
            alt="ParagonCare"
            width={140}
            height={35}
            className="h-6 w-auto opacity-60"
          />
          <p className="text-xs text-paragon-gray">&copy; 2026 ParagonCare Ltd. All rights reserved. We supply customers within Australia and New Zealand.</p>
        </div>
      </footer>
    </main>
  )
}
