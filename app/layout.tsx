import type { Metadata } from 'next'
import { Cinzel, Source_Sans_3 } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const display = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
})

const body = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Elf Name Generator & OC Creator',
  description: 'Generate unique elf names and create original characters with AI-powered tools',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
