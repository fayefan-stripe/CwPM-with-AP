import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stripe Demo',
}

export default function ImagineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
