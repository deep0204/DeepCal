'use client'

import { useState, useMemo } from 'react'
import { Booking } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MoreHorizontal, X, CalendarDays, Video } from 'lucide-react'
import { cancelBookingAction } from '@/lib/actions'
import { toast } from "sonner"

interface BookingsListProps {
  bookings: Booking[]
  type: 'upcoming' | 'past' | 'cancelled'
}

export function BookingsList({ bookings, type }: BookingsListProps) {
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')
  const [loading, setLoading] = useState(false)

  // 1. EXACT FORMATTING TO MATCH CAL.COM
  const formatDateHeader = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', day: 'numeric', month: 'short'
    }) // e.g., "Thu, 19 Mar"
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true
    }).toLowerCase().replace(' ', '') // e.g., "9:45am"
  }

  // 2. THE MAGIC: GROUP BOOKINGS BY DATE
  const groupedBookings = useMemo(() => {
    const groups: { [key: string]: Booking[] } = {}
    bookings.forEach(booking => {
      const dateHeader = formatDateHeader(booking.start_time)
      if (!groups[dateHeader]) {
        groups[dateHeader] = []
      }
      groups[dateHeader].push(booking)
    })
    return groups
  }, [bookings])

  // Handlers
  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setCancellationReason('')
    setCancelModalOpen(true)
  }

  const handleCancel = async () => {
    if (!selectedBooking) return
    setLoading(true)
    const result = await cancelBookingAction(selectedBooking.id, cancellationReason)
    setLoading(false)

    if (result.error) {
      toast.error(`Error: ${result.error}`)
    } else {
      setCancelModalOpen(false)
      setSelectedBooking(null)
      toast.success("Booking cancelled successfully")
    }
  }

  // Empty State
  if (bookings.length === 0) {
    return (
      <div className="border border-dashed border-border bg-card/50 rounded-xl w-full flex flex-col items-center justify-center py-20 px-4">
        <div className="rounded-full bg-muted p-4 mb-4">
          <CalendarDays className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-foreground text-center">
          {type === 'upcoming' ? 'No upcoming bookings' : type === 'past' ? 'No past bookings' : 'No cancelled bookings'}
        </h3>
        <p className="text-muted-foreground text-center max-w-sm text-sm">
          {type === 'upcoming' ? 'When someone books a meeting with you, it will appear here.' : type === 'past' ? 'Your completed meetings will appear here.' : 'Cancelled bookings will appear here.'}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8 w-full">
        {Object.entries(groupedBookings).map(([date, dayBookings]) => (
          <div key={date} className="space-y-3">
            
            {/* DATE HEADER (e.g., "Thu, 19 Mar") */}
            <h4 className="text-sm font-semibold text-foreground px-1 uppercase tracking-wider text-muted-foreground">
              {date}
            </h4>

            {/* BOOKINGS FOR THIS DATE */}
            <div className="border border-border rounded-xl bg-card overflow-hidden w-full shadow-sm">
              {dayBookings.map((booking, index) => (
                <div 
                  key={booking.id} 
                  className={`flex flex-col sm:flex-row items-start p-4 sm:p-5 transition-colors hover:bg-muted/30 ${
                    index !== dayBookings.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  
                  {/* Left Column: Time & Video Link */}
                  <div className="w-full sm:w-48 shrink-0 mb-3 sm:mb-0 flex flex-col space-y-1">
                    <span className="text-sm text-foreground font-medium">
                      {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </span>
                    
                    {/* Fake Video Link */}
                    {type !== 'cancelled' && (
                      <div className="flex items-center gap-1.5 mt-1 text-primary hover:underline cursor-pointer">
                        <Video className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold">Join Video</span>
                      </div>
                    )}
                  </div>

                  {/* Middle Column: Details (Title, Notes, Participants) */}
                  <div className="flex-1 min-w-0 flex flex-col space-y-1 pr-4">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {booking.event_type?.title} between You and {booking.guest_name}
                    </span>
                    
                    {booking.guest_notes && (
                      <span className="text-sm text-muted-foreground truncate">
                        "{booking.guest_notes}"
                      </span>
                    )}
                    
                    <span className="text-sm text-muted-foreground truncate">
                      You and {booking.guest_name}
                    </span>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="shrink-0 mt-3 sm:mt-0 flex items-center justify-end w-full sm:w-auto">
                    {type === 'upcoming' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => handleCancelClick(booking)} 
                            className="text-destructive focus:text-destructive cursor-pointer"
                          >
                            <X className="h-4 w-4 mr-2" /> Cancel Booking
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Fake Pagination Footer to complete the look */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-2 pt-2">
          <span>10 rows per page</span>
          <span>1-{bookings.length} of {bookings.length}</span>
        </div>
      </div>

      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        {/* ... (Keep your existing Dialog code exactly the same) ... */}
        <DialogContent className="bg-card text-foreground border-border w-[90vw] max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>Are you sure you want to cancel this booking? The guest will be notified.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for cancellation (optional)</Label>
              <Textarea 
                id="reason" 
                className="bg-background" 
                value={cancellationReason} 
                onChange={(e) => setCancellationReason(e.target.value)} 
                placeholder="Let the guest know why you're cancelling..." 
                rows={3} 
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)} disabled={loading} className="w-full sm:w-auto">Keep Booking</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}