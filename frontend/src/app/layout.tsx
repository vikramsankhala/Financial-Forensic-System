import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { SnackbarProvider } from '@/providers/SnackbarProvider'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fraud Detection Forensic Systems',
  description: 'Production-grade real-time financial fraud detection and forensics platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              <SnackbarProvider>
                {children}
              </SnackbarProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

