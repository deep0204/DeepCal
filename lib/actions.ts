'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createEventTypeAction(data: {
  title: string
  description: string
  duration: number
  slug: string
  color: string
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
        userId: user.id,
      }
    })

    // This tells Next.js to instantly clear the cache and refresh the dashboard UI
    revalidatePath('/dashboard/event-types')
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
    console.log("🚀 INCOMING BOOKING DATA:", data) // <-- This will tell us if name/email is missing
  
    try {
      await prisma.booking.create({
        data: {
          eventTypeId: data.eventTypeId,
          startTime: data.startTime,
          endTime: data.endTime,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestNotes: data.guestNotes,
        }
      })
  
      revalidatePath('/dashboard/bookings')
      return { success: true }
    } catch (error) {
      console.log("❌❌❌ PRISMA CRASHED ❌❌❌")
      console.log(error)
      return { error: 'Failed to schedule meeting' }
    }
  }

  export async function getAvailableTimeSlots(eventTypeId: string, dateStr: string) {
    try {
      // 1. Setup the target date and day of week (0 = Sunday, 1 = Monday...)
      const targetDate = new Date(dateStr)
      const dayOfWeek = targetDate.getDay()
  
      // 2. Fetch the Event Type to know the duration
      const eventType = await prisma.eventType.findUnique({ 
        where: { id: eventTypeId } 
      })
      if (!eventType) throw new Error("Event type not found")
  
      // 3. Fetch the user's Availability for this specific day
      const schedule = await prisma.availability.findUnique({
        where: {
          userId_dayOfWeek: { userId: eventType.userId, dayOfWeek }
        }
      })
  
      // If they don't work this day, or the day is turned off, return no slots!
      if (!schedule || !schedule.isActive) return []
  
      // 4. Fetch all existing bookings for this exact day to prevent overlaps
      const startOfDay = new Date(targetDate)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)
  
      const existingBookings = await prisma.booking.findMany({
        where: {
          eventType: { userId: eventType.userId },
          startTime: { gte: startOfDay },
          endTime: { lte: endOfDay },
          status: { not: 'cancelled' } // Cancelled meetings don't block time!
        }
      })
  
      // 5. THE GENERATOR LOOP
      const availableSlots: string[] = []
      
      // Convert "09:00" string from database into usable Date objects
      const [startHour, startMin] = schedule.startTime.split(':').map(Number)
      const [endHour, endMin] = schedule.endTime.split(':').map(Number)
  
      const currentTime = new Date(targetDate)
      currentTime.setHours(startHour, startMin, 0, 0)
  
      const endOfWorkDay = new Date(targetDate)
      endOfWorkDay.setHours(endHour, endMin, 0, 0)
  
      const now = new Date()
  
      // Keep generating slots until we hit the end of the work day
      while (currentTime < endOfWorkDay) {
        // Calculate when this specific meeting would end
        const slotEndTime = new Date(currentTime.getTime() + eventType.duration * 60000)
  
        // Rule: The meeting cannot bleed past the end of the work day
        if (slotEndTime > endOfWorkDay) break
  
        // Rule: Check for overlaps with existing bookings
        const isOverlapping = existingBookings.some((booking) => {
          return (
            (currentTime >= booking.startTime && currentTime < booking.endTime) ||
            (slotEndTime > booking.startTime && slotEndTime <= booking.endTime) ||
            (currentTime <= booking.startTime && slotEndTime >= booking.endTime)
          )
        })
  
        // Rule: You cannot book a meeting in the past
        const isPast = currentTime < now
  
        // If it passes all checks, format it as "HH:MM" and add it to our array!
        if (!isOverlapping && !isPast) {
          availableSlots.push(
            currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
          )
        }
  
        // Step forward by the event duration (e.g., advance 30 mins)
        currentTime.setTime(currentTime.getTime() + eventType.duration * 60000)
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
  
      // Instantly refresh the bookings dashboard
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
        }
      })
      revalidatePath('/dashboard/event-types')
      return { success: true }
    } catch (error: any) {
      if (error.code === 'P2002') return { error: 'URL Slug already exists' }
      return { error: 'Failed to update event type' }
    }
  }