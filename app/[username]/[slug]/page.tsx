import { BookingFlow } from '@/components/booking/booking-flow'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function PublicBookingPage({ 
  params 
}: { 
  params: Promise<{ username: string, slug: string }> // <-- 1. Change type to Promise
}) {
  // 2. Await the params to actually get the URL data!
  const resolvedParams = await params;
  const username = resolvedParams.username;
  const slug = resolvedParams.slug;

  // 3. Now pass the resolved variables to Prisma
  const user = await prisma.user.findUnique({
    where: { username: username },
    include: {
      eventTypes: {
        where: { slug: slug, isActive: true }
      }
    }
  })

  if (!user || user.eventTypes.length === 0) {
    notFound()
  }

  const eventType = user.eventTypes[0]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm">
        <BookingFlow eventType={eventType} username={user.username} />
      </div>
    </div>
  )
}