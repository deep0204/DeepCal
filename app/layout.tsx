import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/sonner" // 1. Import Toaster

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DeepCal',
  description: 'Scheduling made simple.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        {/* 2. Add Toaster right before the closing body tag */}
        <Toaster position="bottom-right" theme="dark" richColors />
      </body>
    </html>
  )
}