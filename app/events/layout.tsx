import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events Travel — Official Travel Packages',
}

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
