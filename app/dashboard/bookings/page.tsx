import { BookingsList } from '@/components/dashboard/bookings-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Booking } from '@/lib/types'
import prisma from '@/lib/prisma'

export default async function BookingsPage() {
  // 1. Find our default user
  const user = await prisma.user.findUnique({
    where: { username: 'defaultuser' }
  })

  // 2. Fetch all real bookings connected to this user's event types
  const dbBookings = await prisma.booking.findMany({
    where: {
      eventType: {
        userId: user?.id
      }
    },
    include: {
      eventType: true // Pulls in title, color, duration
    }
  })

  // 3. Format the data to match your UI's exact TypeScript interface
  const formattedBookings: Booking[] = dbBookings.map((b) => {
    // Auto-detect if an "upcoming" meeting has actually already happened based on the clock
    let computedStatus = b.status as 'upcoming' | 'past' | 'cancelled';
    if (computedStatus === 'upcoming' && new Date(b.endTime) < new Date()) {
      computedStatus = 'past';
    }

    return {
      id: b.id,
      event_type: {
        title: b.eventType.title,
        color: b.eventType.color,
        duration: b.eventType.duration,
      },
      start_time: b.startTime.toISOString(),
      end_time: b.endTime.toISOString(),
      guest_name: b.guestName,
      guest_email: b.guestEmail,
      guest_notes: b.guestNotes,
      status: computedStatus,
      cancellation_reason: b.cancellationReason,
    }
  })

  // 4. Filter into categories and sort them logically
  const upcoming = formattedBookings
    .filter(b => b.status === 'upcoming')
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()) // Closest first

  const past = formattedBookings
    .filter(b => b.status === 'past')
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()) // Most recent first

  const cancelled = formattedBookings
    .filter(b => b.status === 'cancelled')
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Bookings</h1>
        <p className="text-muted-foreground mt-1 text-sm">See upcoming and past events booked through your event type links.</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="bg-muted/50 border border-border">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="upcoming">
            <BookingsList bookings={upcoming} type="upcoming" />
          </TabsContent>
          <TabsContent value="past">
            <BookingsList bookings={past} type="past" />
          </TabsContent>
          <TabsContent value="cancelled">
            <BookingsList bookings={cancelled} type="cancelled" />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}