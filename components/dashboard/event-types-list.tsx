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
import { Clock, ExternalLink, MoreHorizontal, Pencil, Trash2, Link as LinkIcon, Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { Switch } from '@/components/ui/switch'
import { deleteEventTypeAction, toggleEventTypeActiveAction } from '@/lib/actions'
import { toast } from "sonner"
import { useState } from 'react'
import { Input } from '@/components/ui/input'
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
  profileLink: string
}

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
  const [isActive, setIsActive] = useState(eventType.isActive)

  const handleToggle = async (newCheckedStatus: boolean) => {
    setIsActive(newCheckedStatus)
    const result = await toggleEventTypeActiveAction(eventType.id, newCheckedStatus)
    
    if (result?.error) {
      setIsActive(!newCheckedStatus)
      toast.error(result.error)
    } else {
      toast.success(newCheckedStatus ? "Event turned on" : "Event turned off")
    }
  }

  return (
    <Card className={`group transition-all border border-border shadow-none hover:border-border/80 rounded-xl overflow-hidden w-full ${!isActive ? 'bg-muted/10 opacity-80' : 'bg-card'}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          
          <div className="flex-1 min-w-0 flex flex-col space-y-1">
            <div className="flex items-center gap-2.5 min-w-0 w-full flex-wrap">
              <div 
                className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm transition-colors ${!isActive && 'grayscale opacity-50'}`}
                style={{ backgroundColor: eventType.color || '#000000' }}
                title="Event Color"
              />
              <Link href={`/dashboard/event-types/${eventType.id}`} className="text-sm sm:text-base font-semibold text-foreground hover:underline">
                {eventType.title}
              </Link>
              <span className="text-sm text-muted-foreground truncate">
                /{username}/{eventType.slug}
              </span>
            </div>
            {eventType.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 w-full pl-5">
                {eventType.description}
              </p>
            )}
            <div className="flex items-center pt-1 pl-5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 border border-border/50 px-2 py-1 rounded-md">
                <Clock className="h-3 w-3" />
                {eventType.duration}m
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
            <div className="flex items-center gap-3">
              {!isActive && <span className="text-sm text-muted-foreground">Hidden</span>}
              <Switch checked={isActive} onCheckedChange={handleToggle} />
            </div>

            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex">
                <Link href={`/${username}/${eventType.slug}`} target="_blank">
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button variant="outline" size="icon" onClick={() => onCopy(eventType.slug)} className="h-8 w-8 text-muted-foreground hover:text-foreground hidden sm:flex">
                <LinkIcon className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/event-types/${eventType.id}`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCopy(eventType.slug)} className="sm:hidden">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="sm:hidden">
                    <Link href={`/${username}/${eventType.slug}`} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive hover:text-destructive-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </div>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the
                          <strong> {eventType.title}</strong> event type.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(eventType.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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

export function EventTypesList({ eventTypes, username, profileLink }: EventTypesListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const copyLink = async (slug: string) => {
    const url = `${window.location.origin}/${username}/${slug}`
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard!")
        return
      } catch (err) { console.error("Failed to copy securely: ", err) }
    }
    try {
      const textArea = document.createElement("textarea")
      textArea.value = url
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      textArea.remove()
      toast.success("Link copied to clipboard!")
    } catch (err) {
      toast.error("Failed to copy link. Please copy it manually.")
    }
  }

  const handleDelete = async (id: string) => {
      const result = await deleteEventTypeAction(id)
      if (result?.error) toast.error(result.error)
      else toast.success("Event type deleted!")
  }

  const filteredEvents = eventTypes.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-7xl w-full mx-auto space-y-6 sm:space-y-8 overflow-hidden p-2 sm:p-4">
      
      {/* 1. THE TOP HEADER: Title + Search Bar + New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">Event types</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create and manage different event types for people to book.
          </p>
        </div>
        
        {/* Magic: Search and Button Side-by-Side */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {eventTypes.length > 0 && (
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search events..." 
                className="pl-9 bg-card border-border shadow-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          <Link href="/dashboard/event-types/new" className="shrink-0">
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New</span> {/* Hides text on super small screens */}
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. THE PUBLIC PROFILE BANNER */}
      {eventTypes.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 border rounded-xl bg-muted/30 shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <LinkIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Your public profile</h3>
              <Link 
                href={`/${username}`} 
                target="_blank" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-0.5"
              >
                {profileLink}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. THE LIST OR EMPTY STATES */}
      <div className="space-y-4 w-full max-w-full">
        {eventTypes.length === 0 ? (
          // Empty State 1: Zero events created ever
          <Card className="border-dashed bg-card/50 w-full max-w-full">
            <CardContent className="flex flex-col items-center justify-center py-20 px-4">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">No event types yet</h3>
              <p className="text-muted-foreground text-center mb-8 max-w-sm text-sm">
                Create your first event type to start letting people book time on your calendar.
              </p>
              <Link href="/dashboard/event-types/new">
                <Button size="lg" className="rounded-full px-8">+ New Event Type</Button>
              </Link>
            </CardContent>
          </Card>
        ) : filteredEvents.length > 0 ? (
          // The List of Events
          filteredEvents.map((eventType) => (
            <EventTypeCard
              key={eventType.id}
              eventType={eventType}
              username={username}
              onCopy={copyLink}
              onDelete={handleDelete}
            />
          ))
        ) : (
          // Empty State 2: No search results
          <div className="text-center py-12 border border-dashed rounded-xl bg-card/30">
            <p className="text-muted-foreground text-sm">
              No events found matching "<span className="font-semibold text-foreground">{searchQuery}</span>"
            </p>
            <Button 
              variant="link" 
              onClick={() => setSearchQuery('')}
              className="mt-2 text-primary"
            >
              Clear search
            </Button>
          </div>
        )}
      </div>

    </div>
  )
}