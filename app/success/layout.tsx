import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stripe Demo',
}

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
