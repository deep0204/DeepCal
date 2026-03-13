import { EventTypeForm } from '@/components/dashboard/event-type-form'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function EditEventTypePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params
  const id = resolvedParams.id

  // Fetch the specific event type from the database
  const eventType = await prisma.eventType.findUnique({
    where: { id: id }
  })

  // If someone types a random ID in the URL, throw a 404
  if (!eventType) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Event Type</h1>
        <p className="text-muted-foreground mt-1 text-sm">Update your meeting details and settings.</p>
      </div>

      {/* Pass the database data directly into our smart form! */}
      <EventTypeForm initialData={eventType} />
    </div>
  )
}