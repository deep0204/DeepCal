import { EventTypeForm } from '@/components/dashboard/event-type-form'

export default function NewEventTypePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">New Event Type</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Create a new event type for people to book times with you.
        </p>
      </div>
      
      <EventTypeForm />
    </div>
  )
}