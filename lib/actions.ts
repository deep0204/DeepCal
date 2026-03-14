'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'

// Initialize Resend at the top so all functions can access it!
const resend = new Resend(process.env.RESEND_API_KEY)

export async function createEventTypeAction(data: {
  title: string
  description: string
  duration: number
  slug: string
  color: string
  bufferTime: number // <-- ADDED
}) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: 'defaultuser' }
    })

    if (!user) throw new Error("Default user not found")

    await prisma.eventType.create({
      data: {
        title: data.title,
        description: data.description,
        duration: Number(data.duration),
        slug: data.slug,
        color: data.color,
        bufferTime: Number(data.bufferTime || 0), // <-- ADDED
        userId: user.id,
      }
    })

    // This tells Next.js to instantly clear the cache and refresh the dashboard UI
    revalidatePath('/dashboard/event-types')
    revalidatePath('/dashboard/bookings')
    return { success: true }
  } catch (error: any) {
    if (error.code === 'P2002') return { error: 'URL Slug already exists' }
    return { error: 'Failed to create event type' }
  }
}

export async function updateAvailabilityAction(schedules: { 
    dayOfWeek: number, 
    startTime: string, 
    endTime: string, 
    isActive: boolean 
  }[]) {
    try {
      const user = await prisma.user.findUnique({
        where: { username: 'defaultuser' }
      })
  
      if (!user) throw new Error("Default user not found")
  
      // We use a database transaction to safely save all 7 days at once
      await prisma.$transaction(
        schedules.map((schedule) => 
          prisma.availability.upsert({
            where: {
              userId_dayOfWeek: {
                userId: user.id,
                dayOfWeek: schedule.dayOfWeek,
              }
            },
            update: {
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              isActive: schedule.isActive,
            },
            create: {
              userId: user.id,
              dayOfWeek: schedule.dayOfWeek,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              isActive: schedule.isActive,
            }
          })
        )
      )
  
      revalidatePath('/dashboard/availability')
      return { success: true }
    } catch (error) {
      console.error("Failed to update availability:", error)
      return { error: 'Failed to save availability' }
    }
}

export async function createBookingAction(data: {
    eventTypeId: string
    startTime: Date
    endTime: Date
    guestName: string
    guestEmail: string
    guestNotes?: string
}) {
    try {
      const eventType = await prisma.eventType.findUnique({
        where: { id: data.eventTypeId }
      })
  
      if (!eventType) return { error: 'Event type not found' }
  
      // 1. Save the booking to the database
      const booking = await prisma.booking.create({
        data: {
          eventTypeId: data.eventTypeId,
          startTime: data.startTime,
          endTime: data.endTime,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestNotes: data.guestNotes,
          status: 'upcoming'
        }
      })
  
      // 2. Format the date and time for the email
      const meetingDate = data.startTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      const meetingTime = `${data.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${data.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  
      // 3. FIRE THE EMAIL!
      try {
        await resend.emails.send({
          from: 'DeepCal <onboarding@resend.dev>', // Must use this on the free tier
          to: data.guestEmail, // Remember: This must be your registered Resend email during testing!
          subject: `Confirmed: ${eventType.title} with Deep Bansal`,
          html: `
            <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h2 style="color: #111827;">Booking Confirmed! 🎉</h2>
              <p style="color: #374151; font-size: 16px;">Hi ${data.guestName},</p>
              <p style="color: #374151; font-size: 16px;">Your meeting has been successfully scheduled. Here are the details:</p>
              
              <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; color: #111827;"><strong>Event:</strong> ${eventType.title}</p>
                <p style="margin: 0 0 8px 0; color: #111827;"><strong>Date:</strong> ${meetingDate}</p>
                <p style="margin: 0 0 0 0; color: #111827;"><strong>Time:</strong> ${meetingTime} (Asia/Kolkata)</p>
              </div>
              
              ${data.guestNotes ? `<p style="color: #4b5563; font-size: 14px;"><strong>Your Notes:</strong> ${data.guestNotes}</p>` : ''}
              
              <p style="color: #374151; font-size: 16px;">A calendar invitation with the Google Meet link will be provided separately.</p>
              <br/>
              <p style="color: #111827; font-weight: bold; margin: 0;">Thanks,</p>
              <p style="color: #111827; margin: 0;">DeepCal</p>
            </div>
          `
        })
        console.log("Email sent successfully!")
      } catch (emailError) {
        console.error("Failed to send Resend email:", emailError)
      }
  
      revalidatePath('/dashboard/bookings')
      return { success: true }
  
    } catch (error) {
      console.error("Booking error:", error)
      return { error: 'Failed to create booking' }
    }
}

export async function getAvailableTimeSlots(eventTypeId: string, dateStr: string) {
  try {
    const targetDate = new Date(dateStr)
    const dayOfWeek = targetDate.getDay()

    const eventType = await prisma.eventType.findUnique({ 
      where: { id: eventTypeId } 
    })
    if (!eventType) throw new Error("Event type not found")

    // Setup day boundaries for DB queries
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    // 🛡️ THE OVERRIDE CHECK: Does this specific date have an override?
    const dateOverride = await prisma.dateOverride.findFirst({
      where: {
        userId: eventType.userId,
        date: { gte: startOfDay, lte: endOfDay }
      }
    })

    let activeStartTime = ""
    let activeEndTime = ""

    if (dateOverride) {
      // If marked totally unavailable, instantly return NO SLOTS!
      if (dateOverride.isUnavailable) return []

      // Otherwise, use their custom hours for this specific day
      activeStartTime = dateOverride.startTime!
      activeEndTime = dateOverride.endTime!
    } else {
      // FALLBACK: No override found, use the standard weekly schedule
      const schedule = await prisma.availability.findUnique({
        where: {
          userId_dayOfWeek: { userId: eventType.userId, dayOfWeek }
        }
      })
  
      if (!schedule || !schedule.isActive) return []

      activeStartTime = schedule.startTime
      activeEndTime = schedule.endTime
    }

    const existingBookings = await prisma.booking.findMany({
      where: {
        eventType: { userId: eventType.userId },
        startTime: { gte: startOfDay },
        endTime: { lte: endOfDay },
        status: { not: 'cancelled' } 
      }
    })

    const availableSlots: string[] = []
    
    // Use the dynamically decided active start/end times!
    const [startHour, startMin] = activeStartTime.split(':').map(Number)
    const [endHour, endMin] = activeEndTime.split(':').map(Number)

    const currentTime = new Date(targetDate)
    currentTime.setHours(startHour, startMin, 0, 0)

    const endOfWorkDay = new Date(targetDate)
    endOfWorkDay.setHours(endHour, endMin, 0, 0)

    const now = new Date()
    
    // Calculate the buffer in milliseconds
    const bufferMs = (eventType.bufferTime || 0) * 60000

    while (currentTime < endOfWorkDay) {
      const slotEndTime = new Date(currentTime.getTime() + eventType.duration * 60000)

      if (slotEndTime > endOfWorkDay) break

      let jumpToTime: Date | null = null

      // 🛡️ THE FORCE FIELD WITH SMART JUMP TRACKING
      const isOverlapping = existingBookings.some((booking) => {
        const blockedStart = new Date(booking.startTime.getTime() - bufferMs)
        const blockedEnd = new Date(booking.endTime.getTime() + bufferMs)

        if (
          (currentTime >= blockedStart && currentTime < blockedEnd) ||
          (slotEndTime > blockedStart && slotEndTime <= blockedEnd) ||
          (currentTime <= blockedStart && slotEndTime >= blockedEnd)
        ) {
          jumpToTime = blockedEnd
          return true
        }
        return false
      })

      const isPast = currentTime < now

      if (!isOverlapping && !isPast) {
        availableSlots.push(
          currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
        )
        currentTime.setTime(currentTime.getTime() + eventType.duration * 60000)
      } else if (jumpToTime) {
        currentTime.setTime((jumpToTime as Date).getTime())
      } else {
        currentTime.setTime(currentTime.getTime() + eventType.duration * 60000)
      }
    }

    return availableSlots

  } catch (error) {
    console.error("Failed to generate time slots:", error)
    return []
  }
}

export async function cancelBookingAction(bookingId: string, reason: string) {
    try {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'cancelled',
          cancellationReason: reason
        }
      })
  
      revalidatePath('/dashboard/bookings')
      return { success: true }
    } catch (error) {
      console.error("Failed to cancel booking:", error)
      return { error: 'Failed to cancel booking' }
    }
}

// --- EVENT TYPE ACTIONS ---

export async function deleteEventTypeAction(id: string) {
    try {
      await prisma.eventType.delete({ where: { id } })
      revalidatePath('/dashboard/event-types')
      revalidatePath('/dashboard/bookings')
      return { success: true }
    } catch (error) {
      return { error: 'Failed to delete event type' }
    }
}
  
export async function toggleEventTypeActiveAction(id: string, isActive: boolean) {
    try {
      await prisma.eventType.update({
        where: { id },
        data: { isActive }
      })
      revalidatePath('/dashboard/event-types')
      return { success: true }
    } catch (error) {
      return { error: 'Failed to toggle status' }
    }
}
  
export async function updateEventTypeAction(id: string, data: {
    title: string
    description: string | null
    duration: number
    slug: string
    color: string
    bufferTime: number // <-- ADDED
}) {
    try {
      await prisma.eventType.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          duration: Number(data.duration),
          slug: data.slug,
          color: data.color,
          bufferTime: Number(data.bufferTime || 0), // <-- ADDED
        }
      })
      revalidatePath('/dashboard/event-types')
      revalidatePath('/dashboard/bookings')
      return { success: true }
    } catch (error: any) {
      if (error.code === 'P2002') return { error: 'URL Slug already exists' }
      return { error: 'Failed to update event type' }
    }
}
export async function addDateOverrideAction(data: {
  date: string;
  startTime?: string;
  endTime?: string;
  isUnavailable: boolean;
}) {
  try {
    // Note: Assuming 'defaultuser' as per the assignment rules
    const user = await prisma.user.findUnique({ where: { username: 'defaultuser' } })
    if (!user) return { error: "User not found" }

    // Convert the YYYY-MM-DD string to a proper DateTime object
    const overrideDate = new Date(data.date)

    await prisma.dateOverride.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: overrideDate
        }
      },
      update: {
        startTime: data.isUnavailable ? null : data.startTime,
        endTime: data.isUnavailable ? null : data.endTime,
        isUnavailable: data.isUnavailable,
      },
      create: {
        userId: user.id,
        date: overrideDate,
        startTime: data.isUnavailable ? null : data.startTime,
        endTime: data.isUnavailable ? null : data.endTime,
        isUnavailable: data.isUnavailable,
      }
    })

    revalidatePath('/dashboard/availability')
    revalidatePath('/[username]', 'layout')

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to set date override" }
  }
}

export async function deleteDateOverrideAction(id: string) {
  try {
    await prisma.dateOverride.delete({ where: { id } })
    revalidatePath('/dashboard/availability')
    revalidatePath('/[username]', 'layout')
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete date override" }
  }
}
export async function updateTimezoneAction(newTimezone: string) {
  try {
    // Assuming 'defaultuser' is the username you are using for the assignment bypass
    await prisma.user.update({
      where: { username: 'defaultuser' }, 
      data: { timezone: newTimezone }
    })
    
    revalidatePath('/dashboard/availability')
    revalidatePath('/[username]', 'layout') // Clear public pages too
    
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to update timezone' }
  }
}