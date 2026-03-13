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
import { useRouter } from 'next/navigation'
import { toast } from "sonner"

interface EventTypesListProps {
  eventTypes: EventType[]
  username: string
}

export function EventTypesList({ eventTypes, username }: EventTypesListProps) {
  const router = useRouter()

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
      if (result.error) toast.error(result.error)
    }
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const result = await toggleEventTypeActiveAction(id, !currentStatus)
    if (result.error) toast.error(result.error)
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
        <Card
          key={eventType.id}
          className="group transition-all bg-card border-border/50 shadow-none hover:border-border overflow-hidden w-full"
        >
          <CardContent className="p-0">
            <div className="flex items-stretch w-full">
              
              <div
                className="w-1.5 shrink-0"
                style={{ backgroundColor: eventType.color }}
              />

              <div className="flex-1 min-w-0 p-4 sm:p-5 flex justify-between items-start gap-2 sm:gap-4">

                <div className="flex-1 min-w-0 flex flex-col">
                  
                  <div className="flex items-center gap-2 min-w-0 mb-1.5 w-full">
                    {/* ADDED block and max-w-full to force truncation */}
                    <Link
                      href={`/dashboard/event-types/${eventType.id}`}
                      className="text-base sm:text-lg font-semibold text-foreground hover:underline truncate block max-w-full"
                    >
                      {eventType.title}
                    </Link>
                    {!eventType.isActive && (
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
                    {/* ADDED block max-w-full */}
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
                    checked={eventType.isActive}
                    onCheckedChange={() => handleToggle(eventType.id, eventType.isActive)}
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
                      <DropdownMenuItem onClick={() => copyLink(eventType.slug)}>
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
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => handleDelete(eventType.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}