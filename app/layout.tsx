import type { Metadata, Viewport } from 'next'
import { Roboto_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// Configuración de fuente optimizada para rendimiento
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: '--font-roboto-mono',
  display: 'swap', // Evita saltos visuales durante la carga
});

export const metadata: Metadata = {
  title: 'NIKIMARU | Trading Terminal',
  description: 'SMC & High-Frequency Trading Intelligence for BTC/USDT',
  generator: 'Nikimaru OS',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Esencial para terminales de trading en móviles
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // suppressHydrationWarning evita errores por diferencias entre servidor y cliente (común en trading charts)
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${robotoMono.variable} font-mono antialiased bg-black text-zinc-200 selection:bg-gold/30`}
      >
        {/* Envolvemos el contenido en un contenedor principal para asegurar el layout full-screen */}
        <div className="relative min-h-screen flex flex-col overflow-hidden">
          {children}
        </div>

        {/* Vercel Analytics para monitorear el rendimiento de la terminal */}
        <Analytics />
      </body>
    </html>
  )
}
