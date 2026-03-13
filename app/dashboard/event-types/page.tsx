import { EventTypesList } from '@/components/dashboard/event-types-list'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import prisma from '@/lib/prisma'

export default async function EventTypesPage() {
  const user = await prisma.user.findUnique({
    where: { username: 'defaultuser' }
  })
  
  const eventTypes = await prisma.eventType.findMany({
    where: { userId: user?.id },
    orderBy: { createdAt: 'desc' }
  })

  return (
    // Added pt-16 to ensure it clears the hamburger menu comfortably, and px-4 for side padding
    <div className="max-w-7xl w-full mx-auto space-y-6 overflow-hidden p-2">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-foreground truncate">Event types</h1>
          {/* Removed truncate here so it wraps naturally on small screens */}
          <p className="text-muted-foreground mt-1 text-sm">
            Configure different events for people to book on your calendar.
          </p>
        </div>
        <Link href="/dashboard/event-types/new" className="shrink-0">
          <Button variant="outline" className="gap-2 bg-background w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            New
          </Button>
        </Link>
      </div>

      <EventTypesList eventTypes={eventTypes} username={user?.username || 'user'} />
    </div>
  )
}