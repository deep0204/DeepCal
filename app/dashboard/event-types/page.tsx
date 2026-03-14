import { EventTypesList } from '@/components/dashboard/event-types-list'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function EventTypesPage() {
  const user = await prisma.user.findUnique({
    where: { username: 'defaultuser' }
  })
  
  const eventTypes = await prisma.eventType.findMany({
    where: { userId: user?.id },
    orderBy: { createdAt: 'desc' }
  })

  // You can replace this with your actual domain later
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const profileLink = `${baseUrl}/${user?.username}`

  return (
    <EventTypesList 
      eventTypes={eventTypes} 
      username={user?.username || 'user'} 
      profileLink={profileLink}
    />
  )
}