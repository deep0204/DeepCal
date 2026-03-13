import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider" // 1. Import it

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* 3. Wrap everything inside the body with the ThemeProvider */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" theme="system" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}