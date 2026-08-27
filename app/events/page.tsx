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
      <div className="max-w-6xl mx-auto px-6 pb-32">
        <div className="relative w-full aspect-[16/7] rounded-lg overflow-hidden bg-gray-100">
          <Image
            src="/events-hero.png"
            alt="Formula 1 Singapore Grand Prix night scene"
            fill
            className="object-cover object-center"
            priority
          />
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
