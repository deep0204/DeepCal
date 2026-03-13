'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Clock, CalendarDays, ArrowLeft, Video, Globe, CheckCircle2 } from 'lucide-react'
import { createBookingAction, getAvailableTimeSlots } from '@/lib/actions'
import { EventType } from '@/lib/types'
import { toast } from "sonner"

export function BookingFlow({ eventType, username }: { eventType: EventType, username: string }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  
  // ADDED 'success' to our steps!
  const [step, setStep] = useState<'calendar' | 'form' | 'success'>('calendar')
  const [loading, setLoading] = useState(false)
  
  // State to hold the email for the success screen
  const [bookedEmail, setBookedEmail] = useState('')
  
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [loadingTimes, setLoadingTimes] = useState(false)
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function fetchTimes() {
      if (!date) return
      
      setLoadingTimes(true)
      setSelectedTime(null) 
      
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
      const slots = await getAvailableTimeSlots(eventType.id, dateStr)
      setAvailableTimes(slots)
      setLoadingTimes(false)
    }

    fetchTimes()
  }, [date, eventType.id])
  
  const handleConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!date || !selectedTime) return

    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const notes = formData.get('notes') as string

    // Save the email to show on the success screen
    setBookedEmail(email)

    const [hours, minutes] = selectedTime.split(':').map(Number)
    const startTime = new Date(date)
    startTime.setHours(hours, minutes, 0, 0)
    
    const endTime = new Date(startTime.getTime() + eventType.duration * 60000)

    const result = await createBookingAction({
      eventTypeId: eventType.id,
      startTime,
      endTime,
      guestName: name,
      guestEmail: email,
      guestNotes: notes
    })

    setLoading(false)

    if (result.error) {
      toast.error(`Error: ${result.error}`)
    } else {
      // INSTEAD of an alert, we smoothly transition to the success screen!
      setStep('success') 
    }
  }

  const formattedDate = date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  if (!mounted) {
    return <div className="min-h-[400px] flex items-center justify-center text-muted-foreground">Loading calendar...</div>
  }

  // --- NEW SUCCESS SCREEN ---
  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 text-center animate-in zoom-in-95 duration-300 w-full min-h-[400px]">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">You are scheduled!</h2>
        <p className="text-muted-foreground mb-8 text-sm sm:text-base">
          A calendar invitation has been sent to <span className="font-medium text-foreground">{bookedEmail}</span>.
        </p>

        <div className="bg-muted/50 rounded-xl p-6 mb-8 text-left w-full max-w-sm border border-border/50">
          <h3 className="font-semibold text-lg text-foreground mb-4">{eventType.title}</h3>
          <div className="space-y-3 text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{selectedTime} ({eventType.duration} Min)</span>
            </div>
            <div className="flex items-center gap-3">
              <Video className="w-4 h-4 text-primary flex-shrink-0" />
              <span>Google Meet</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-primary flex-shrink-0" />
              <span>Asia/Kolkata</span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => {
            setStep('calendar')
            setSelectedTime(null)
            setDate(new Date())
          }}
          variant="outline"
          className="w-full sm:w-auto"
        >
          Schedule another meeting
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[400px]">
      {/* LEFT COLUMN: Event Details */}
      <div className="p-6 md:p-8 md:w-1/3 border-b md:border-b-0 md:border-r border-border/40 bg-card/50">
        <h3 className="text-muted-foreground font-semibold mb-1">{username}</h3>
        <h1 className="text-2xl font-bold text-foreground mb-4">{eventType.title}</h1>
        
        <div className="space-y-3 text-muted-foreground font-medium">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>{eventType.duration} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            <span>Google Meet</span>
          </div>
          {step === 'form' && date && selectedTime && (
            <div className="flex items-start gap-2 text-primary">
              <CalendarDays className="w-5 h-5 mt-0.5 shrink-0" />
              <span>
                {selectedTime} - {formattedDate}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 pt-2">
            <Globe className="w-5 h-5" />
            <span>Asia/Kolkata</span>
          </div>
        </div>
        
        {step === 'calendar' && (
          <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
            {eventType.description || "Please select a time that works for you."}
          </p>
        )}
      </div>

      {/* RIGHT COLUMN: Interactive Area */}
      <div className="p-6 md:p-8 md:w-2/3 bg-card">
        {step === 'calendar' ? (
          <div className="flex flex-col sm:flex-row gap-8">
            {/* Calendar */}
            <div className="flex-1 overflow-hidden">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Select a Date & Time</h2>
              <div className="flex justify-center sm:justify-start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="border border-border/40 rounded-md p-3 max-w-full"
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} 
                />
              </div>
            </div>
            
            {/* Time Slots */}
            {date && (
              <div className="w-full sm:w-48 flex flex-col">
                <h2 className="text-sm font-medium mb-4 text-foreground text-center sm:text-left">{formattedDate}</h2>
                
                {loadingTimes ? (
                  <div className="flex-1 flex items-center justify-center min-h-[200px]">
                    <p className="text-sm text-muted-foreground animate-pulse">Calculating times...</p>
                  </div>
                ) : availableTimes.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] text-center space-y-2">
                    <p className="text-sm text-foreground font-medium">No times available</p>
                    <p className="text-xs text-muted-foreground">Try selecting a different date.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {availableTimes.map((time) => (
                      <div key={time} className="flex gap-2 transition-all">
                        <Button
                          variant={selectedTime === time ? "default" : "outline"}
                          className={`w-full bg-background hover:bg-muted ${selectedTime === time ? 'w-1/2 bg-muted text-foreground' : ''}`}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                        {selectedTime === time && (
                          <Button 
                            className="w-1/2 bg-foreground text-background hover:bg-foreground/90 transition-all animate-in slide-in-from-left-2"
                            onClick={() => setStep('form')}
                          >
                            Next
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Booking Form */
          <div className="max-w-md animate-in fade-in slide-in-from-right-4 duration-300">
            <Button 
              variant="ghost" 
              className="mb-4 -ml-4 text-muted-foreground hover:text-foreground"
              onClick={() => setStep('calendar')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            
            <h2 className="text-xl font-bold mb-6 text-foreground">Enter Details</h2>
            
            <form onSubmit={handleConfirm} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required className="bg-background" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required className="bg-background" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea 
                  id="notes" 
                  name="notes"
                  className="bg-background" 
                  placeholder="Please share anything that will help prepare for our meeting."
                  rows={4}
                />
              </div>
              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Confirming...' : 'Schedule Event'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}