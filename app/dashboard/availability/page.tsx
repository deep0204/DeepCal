import { AvailabilitySettings } from '@/components/dashboard/availability-settings'
import prisma from '@/lib/prisma'

export default async function AvailabilityPage() {
  // 1. Fetch the user
  const user = await prisma.user.findUnique({
    where: { username: 'defaultuser' }
  })

  if (!user) return <div>User not found</div>;

  // 2. Fetch their saved availability
  const dbAvailability = await prisma.availability.findMany({
    where: { userId: user.id }
  })

  // 3. Fetch their Date Overrides!
  const dbOverrides = await prisma.dateOverride.findMany({
    where: { userId: user.id }
  })

  // 4. Format the data to match what our UI expects
  const formattedSchedules = dbAvailability.map(a => ({
    day_of_week: a.dayOfWeek,
    start_time: a.startTime,
    end_time: a.endTime,
    is_available: a.isActive
  }))

  return (
    <div className="max-w-7xl w-full mx-auto space-y-6 p-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Availability</h1>
        <p className="text-muted-foreground mt-1 text-sm">Configure your regular working hours.</p>
      </div>

      <AvailabilitySettings 
        availability={{ id: '1', timezone: user.timezone || 'Asia/Kolkata' }} 
        schedules={formattedSchedules} 
        dateOverrides={dbOverrides} // MAGIC: Passed the overrides to the client!
      />
    </div>
  )
}