'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/events" className="text-lg font-bold tracking-tight text-gray-900">
            EVENTS TRAVEL
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
            <button className="flex items-center gap-1 hover:text-blue-600">
              Explore all events
              <ChevronDown />
            </button>
            <button className="flex items-center gap-1 hover:text-blue-600">
              Resources
              <ChevronDown />
            </button>
            <button className="flex items-center gap-1 hover:text-blue-600">
              Corporate solutions
              <span className="ml-1 text-[10px] font-semibold bg-gray-900 text-white px-1.5 py-0.5 rounded">
                COMING SOON
              </span>
              <ChevronDown />
            </button>
          </nav>
          <button className="bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
            Talk to an expert
          </button>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <p className="text-xs text-gray-500 leading-relaxed">
          Home / Events / Formula 1® / FORMULA 1 SINGAPORE AIRLINES SINGAPORE GRAND PRIX 2024 /{' '}
          <span className="text-gray-700">6-Night Flight Package ex Melbourne</span>
        </p>
      </div>

      {/* Title Section */}
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-4">
        <span className="inline-block text-xs font-semibold text-[#0066FF] bg-blue-50 px-3 py-1 rounded-full mb-4">
          OFFICIAL TRAVEL PACKAGE
        </span>
        <div className="flex items-start justify-between gap-6">
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 leading-tight max-w-3xl">
            6-Night Flight Package ex Melbourne
          </h1>
          <div className="hidden sm:flex flex-col items-end gap-2 flex-shrink-0">
            <span className="text-[10px] font-semibold text-gray-400 tracking-widest">SHARE</span>
            <div className="flex gap-2">
              <ShareButton label="Facebook" />
              <ShareButton label="WhatsApp" />
              <ShareButton label="Email" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="max-w-6xl mx-auto px-6">
        <Image
          src="/events-hero.jpg"
          alt="Formula 1 car at Singapore Grand Prix with Marina Bay Sands skyline"
          width={1024}
          height={349}
          className="w-full h-auto rounded-lg"
          priority
        />
      </div>

      {/* Package Content */}
      <div className="max-w-6xl mx-auto px-6 py-10 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 lg:gap-14">
          {/* Main content */}
          <div>
            <h2 className="text-2xl font-serif text-gray-900 mb-6">About this package</h2>

            <div className="space-y-5 text-sm text-gray-700 leading-relaxed">
              <p className="font-semibold text-gray-900">
                Relax and discover Singapore, and the original Formula 1® night race, with our
                6-Night Flight Package ex Melbourne — the best way to experience the action
                trackside and explore Singapore.
              </p>

              <p>
                Fly Qantas return from Melbourne, including 23 kg checked luggage, hand luggage,
                and full onboard meals and drinks at convenient flight times. Enjoy private
                airport transfers (now shared) to and from your hotel for a smooth, stress-free
                arrival and departure.
              </p>

              <p>
                Stay six nights (8–14 October 2026) at your choice of hand-picked 4 or 5-star
                hotels in downtown Singapore, each with daily breakfast and easy access to Marina
                Bay Street Circuit — just minutes away on foot, by MRT or water transfer.
              </p>

              <p>
                Enjoy official 3-Day Padang Grandstand tickets (Fri–Sun) and customise your
                experience with upgrades or downgrades — from Walkabout access and premium Zone 1
                grandstands to Lounge@Turn 3 or the exclusive Formula 1 Paddock Club™, subject
                to availability.
              </p>

              <p>
                With two extra nights compared to the Express Package, you&apos;ll have time to
                explore Gardens by the Bay, Wild Asia, Sentosa Island, and Singapore&apos;s hawker
                gems, rooftop bars and world-class shopping. Relax by the pool or dine
                Michelin-starred before the lights go out each evening and the city comes alive
                in a festival of racing, music and entertainment.
              </p>

              <p>
                Every detail is handled — flights, accommodation, transfers, race tickets and
                expert local support, plus optional sightseeing, travel insurance and extensions
                across Asia.
              </p>

              <p>
                Enjoy more time, better value and a richer experience with the 6-Night Relax
                Package — perfect for travellers who want it all.
              </p>

              <p className="font-semibold text-gray-900">
                Secure your place today — enquire now or request to book.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <span className="text-xs font-semibold text-gray-900 bg-[#F5E642] px-4 py-2 rounded-full">
                LIMITED AVAILABILITY
              </span>
              <span className="text-xs font-semibold text-gray-700 border border-gray-300 px-4 py-2 rounded-full">
                SELLING FAST 🔥
              </span>
            </div>

            <p className="mt-10 text-[10px] text-gray-400 leading-relaxed max-w-2xl">
              F1® is a trademark of Formula One Licensing BV. F1 FORMULA 1 logo, FORMULA 1, F1,
              FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trademarks
              of Formula One Licensing BV. All rights reserved.
            </p>
            <p className="mt-1 text-[10px] text-gray-400">Photo credit: Singapore GP</p>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex justify-end mb-4">
                <span className="text-[10px] font-semibold text-gray-500 border border-gray-300 px-3 py-1 rounded-full">
                  LIKELY TO SELL OUT
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-0.5">STATUS</p>
                  <p className="text-sm font-semibold text-gray-900">LIMITED</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-0.5">STARTING FROM</p>
                  <p className="text-sm font-semibold text-gray-900">A$4,208</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-0.5">EVENT CURRENCY</p>
                  <p className="text-sm font-semibold text-gray-900">$ AUD</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5 mb-5">
                <p className="text-sm font-bold tracking-wide text-gray-900 mb-1">SINGAPOREGP</p>
                <div className="h-px bg-gray-200 mb-4" />
                <p className="text-xs text-gray-500 leading-relaxed">
                  Official Reseller Formula 1 Singapore Airlines Singapore Grand Prix 2026
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-3">PAY IN</p>
                <div className="flex flex-wrap gap-2">
                  {['$ AUD', '$ USD', '£ GBP', '€ EUR', '$ NZD'].map((currency, i) => (
                    <button
                      key={currency}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                        i === 0
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {currency}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-blue-50 px-5 py-3">
                <p className="text-[10px] font-semibold text-gray-500 tracking-widest">WHY EVENTS TRAVEL</p>
              </div>
              <ul className="px-5 py-4 space-y-3">
                {[
                  'Official Reseller',
                  'Guaranteed official tickets and hospitality',
                  'Hand-picked accommodation',
                  'Curated packages and flexible extras',
                  'Personalised service and expert support',
                  'Low deposits and secure bookings',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-xs text-gray-700">
                    <svg className="w-4 h-4 text-[#0066FF] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <button className="hover:text-[#0066FF] transition-colors">Inclusions and prices</button>
            <button className="hover:text-[#0066FF] transition-colors">Map</button>
            <button className="hover:text-[#0066FF] transition-colors">Hotels</button>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="px-6 py-2.5 border border-gray-900 text-gray-900 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors">
              Enquire now
            </button>
            <Link
              href="/events/booking"
              className="px-6 py-2.5 bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm font-medium rounded-full transition-colors"
            >
              Request booking
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChevronDown() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

function ShareButton({ label }: { label: string }) {
  return (
    <button
      aria-label={`Share via ${label}`}
      className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#0066FF] hover:text-[#0066FF] transition-colors"
    >
      <span className="text-xs font-bold">{label[0]}</span>
    </button>
  )
}
