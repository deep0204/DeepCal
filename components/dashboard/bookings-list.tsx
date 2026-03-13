'use client'

import { useState } from 'react'
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
import { Calendar, Clock, Mail, MoreVertical, User, X, CalendarDays } from 'lucide-react'
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
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true,
    })
  }

  if (bookings.length === 0) {
    return (
      <Card className="border-dashed bg-card/50 w-full max-w-full">
        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
          <div className="rounded-full bg-muted p-4 mb-4">
            <CalendarDays className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground text-center">
            {type === 'upcoming' ? 'No upcoming bookings' : type === 'past' ? 'No past bookings' : 'No cancelled bookings'}
          </h3>
          <p className="text-muted-foreground text-center max-w-sm text-sm">
            {type === 'upcoming' ? 'When someone books a meeting with you, it will appear here' : type === 'past' ? 'Your completed meetings will appear here' : 'Cancelled bookings will appear here'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4 w-full max-w-full">
        {bookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-md transition-shadow bg-card overflow-hidden w-full">
            <CardContent className="p-0">
              <div className="flex items-stretch w-full">
                <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: booking.event_type?.color || '#ffffff' }} />
                
                <div className="flex-1 p-4 sm:p-5 min-w-0">
                  <div className="flex items-start justify-between gap-2 sm:gap-4 w-full min-w-0">
                    <div className="flex-1 min-w-0 flex flex-col">
                      <h3 className="font-semibold text-foreground mb-3 truncate block max-w-full">{booking.event_type?.title || 'Event'}</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm text-muted-foreground w-full min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate block max-w-full">{formatDate(booking.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate block max-w-full">{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <User className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate block max-w-full">{booking.guest_name}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0 w-full">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          {/* CRITICAL FIX: Block and max width to stop email from breaking grid */}
                          <span className="truncate block max-w-[200px] sm:max-w-full">{booking.guest_email}</span>
                        </div>
                      </div>

                      {booking.guest_notes && (
                        <p className="text-sm text-muted-foreground mt-4 bg-muted/50 p-3 rounded-md break-words whitespace-pre-wrap w-full">
                          {booking.guest_notes}
                        </p>
                      )}
                    </div>
                    
                    {type === 'upcoming' && (
                      <div className="flex-shrink-0 pl-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="-mr-2 -mt-2"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCancelClick(booking)} className="text-destructive focus:text-destructive cursor-pointer">
                              <X className="h-4 w-4 mr-2" /> Cancel Booking
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="bg-card text-foreground border-border w-[90vw] max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>Are you sure you want to cancel this booking? The guest will be notified.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for cancellation (optional)</Label>
              <Textarea id="reason" className="bg-background" value={cancellationReason} onChange={(e) => setCancellationReason(e.target.value)} placeholder="Let the guest know why you're cancelling..." rows={3} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)} disabled={loading} className="w-full sm:w-auto">Keep Booking</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading} className="w-full sm:w-auto">{loading ? 'Cancelling...' : 'Cancel Booking'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}