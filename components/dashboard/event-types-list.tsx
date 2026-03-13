'use client'

import { EventType } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Clock, Copy, ExternalLink, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Switch } from '@/components/ui/switch'
import { deleteEventTypeAction, toggleEventTypeActiveAction } from '@/lib/actions'
import { toast } from "sonner"
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface EventTypesListProps {
  eventTypes: EventType[]
  username: string
}

// 1. We extracted the individual card into its own component!
// This gives each toggle switch its own personal state to react instantly.
function EventTypeCard({
  eventType,
  username,
  onCopy,
  onDelete
}: {
  eventType: EventType,
  username: string,
  onCopy: (slug: string) => void,
  onDelete: (id: string) => void
}) {
  // THE MAGIC: Local state for instant UI updates
  const [isActive, setIsActive] = useState(eventType.isActive)

  const handleToggle = async (newCheckedStatus: boolean) => {
    // Instantly flip the switch on the screen!
    setIsActive(newCheckedStatus)

    // Fire the server action in the background
    const result = await toggleEventTypeActiveAction(eventType.id, newCheckedStatus)

    // If the database fails, revert the switch and show an error
    if (result?.error) {
      setIsActive(!newCheckedStatus)
      toast.error(result.error)
    } else {
      toast.success(newCheckedStatus ? "Event enabled" : "Event disabled")
    }
  }

  return (
    <Card className="group transition-all bg-card border-border/50 shadow-none hover:border-border overflow-hidden w-full">
      <CardContent className="p-0">
        <div className="flex items-stretch w-full">

          <div
            className="w-1.5 shrink-0"
            style={{ backgroundColor: eventType.color }}
          />

          <div className="flex-1 min-w-0 p-4 sm:p-5 flex justify-between items-start gap-2 sm:gap-4">

            <div className="flex-1 min-w-0 flex flex-col">

              <div className="flex items-center gap-2 min-w-0 mb-1.5 w-full">
                <Link
                  href={`/dashboard/event-types/${eventType.id}`}
                  className="text-base sm:text-lg font-semibold text-foreground hover:underline truncate block max-w-full"
                >
                  {eventType.title}
                </Link>
                {!isActive && (
                  <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground shrink-0 hidden xs:inline-block">
                    Disabled
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground w-full min-w-0">
                <span className="flex items-center gap-1 shrink-0">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  {eventType.duration} min
                </span>
                <span className="truncate block w-full max-w-full">
                  /{username}/{eventType.slug}
                </span>
              </div>

              {eventType.description && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-3 line-clamp-2 break-words whitespace-normal w-full">
                  {eventType.description}
                </p>
              )}
            </div>

            <div className="shrink-0 flex items-center gap-1 pt-0.5 pl-1">
              <Switch
                checked={isActive}
                onCheckedChange={handleToggle}
                className="scale-75 sm:scale-100"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="-mr-2 sm:-mr-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/event-types/${eventType.id}`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCopy(eventType.slug)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${username}/${eventType.slug}`} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive hover:text-destructive-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </div>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the
                          <strong> {eventType.title}</strong> event type and all associated bookings.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(eventType.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Event
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 2. The main list component just maps through the data and passes it to our new card
export function EventTypesList({ eventTypes, username }: EventTypesListProps) {
  const copyLink = async (slug: string) => {
    const url = `${window.location.origin}/${username}/${slug}`

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard!")
        return
      } catch (err) {
        console.error("Failed to copy securely: ", err)
      }
    }

    try {
      const textArea = document.createElement("textarea")
      textArea.value = url
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      document.execCommand('copy')
      textArea.remove()
      toast.success("Link copied to clipboard!")
    } catch (err) {
      console.error("Fallback copy failed: ", err)
      toast.error("Failed to copy link. Please copy it manually.")
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event type? This will also delete all bookings associated with it.")) {
      const result = await deleteEventTypeAction(id)
      if (result?.error) toast.error(result.error)
      else toast.success("Event type deleted!")
    }
  }

  if (eventTypes.length === 0) {
    return (
      <Card className="border-dashed bg-card/50 w-full max-w-full">
        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-center">No event types yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-sm text-sm">
            Create your first event type to get started.
          </p>
          <Link href="/dashboard/event-types/new">
            <Button>+ New Event Type</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-full">
      {eventTypes.map((eventType) => (
        <EventTypeCard
          key={eventType.id}
          eventType={eventType}
          username={username}
          onCopy={copyLink}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}