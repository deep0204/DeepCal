'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Calendar, Clock, Link2, CalendarDays, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { name: 'Event Types', href: '/dashboard/event-types', icon: Link2 },
  { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarDays },
  { name: 'Availability', href: '/dashboard/availability', icon: Clock },
]

export function Sidebar() {
  const pathname = usePathname() || ''
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={() => setMobileOpen(!mobileOpen)} 
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-card border text-foreground"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-background border-r border-border/40 text-foreground transform transition-transform duration-200 ease-in-out lg:transform-none', 
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-5 border-b border-border/40">
            <Calendar className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">DeepCal</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <li key={item.name}>
                    <Link 
                      href={item.href} 
                      onClick={() => setMobileOpen(false)} 
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors', 
                        isActive 
                          ? 'bg-muted text-foreground' 
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}