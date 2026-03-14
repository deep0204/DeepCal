'use client'

import { useState, useEffect } from 'react'
import { Availability, AvailabilitySchedule, DAYS_OF_WEEK, TIMEZONES } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { 
  updateAvailabilityAction, 
  updateTimezoneAction, 
  addDateOverrideAction, 
  deleteDateOverrideAction 
} from '@/lib/actions'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'

// Updated interface to match our Prisma Schema
interface DateOverride {
  id: string
  date: Date | string
  startTime: string | null
  endTime: string | null
  isUnavailable: boolean
}

interface AvailabilitySettingsProps {
  availability: Availability | null
  schedules: AvailabilitySchedule[]
  dateOverrides: DateOverride[]
}

interface ScheduleState {
  day: number
  enabled: boolean
  start: string
  end: string
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  const time = `${hour.toString().padStart(2, '0')}:${minute}`
  const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return { value: time, label: displayTime }
})

export function AvailabilitySettings({ availability, schedules, dateOverrides }: AvailabilitySettingsProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [timezone, setTimezone] = useState(availability?.timezone || 'Asia/Kolkata')

  // Weekly Schedule State
  const initializeSchedules = (): ScheduleState[] => {
    return DAYS_OF_WEEK.map((_, index) => {
      const existingSchedule = schedules.find((s) => s.day_of_week === index)
      return {
        day: index,
        enabled: existingSchedule?.is_available ?? false,
        start: existingSchedule?.start_time?.slice(0, 5) || '09:00',
        end: existingSchedule?.end_time?.slice(0, 5) || '17:00',
      }
    })
  }
  const [scheduleState, setScheduleState] = useState<ScheduleState[]>(initializeSchedules)

  // Date Override State
  const [overrides, setOverrides] = useState<DateOverride[]>(dateOverrides)
  const [newOverrideDate, setNewOverrideDate] = useState('')
  const [overrideStart, setOverrideStart] = useState('09:00')
  const [overrideEnd, setOverrideEnd] = useState('17:00')
  const [isUnavailable, setIsUnavailable] = useState(false)

  // --- HANDLERS ---

  const handleTimezoneChange = async (newTz: string) => {
    setTimezone(newTz)
    const result = await updateTimezoneAction(newTz)
    if (result.success) toast.success("Timezone updated!")
    else toast.error("Failed to update timezone")
  }
  useEffect(() => {
    setOverrides(dateOverrides)
  }, [dateOverrides])
  const updateSchedule = (dayIndex: number, updates: Partial<ScheduleState>) => {
    setScheduleState((prev) => prev.map((s) => (s.day === dayIndex ? { ...s, ...updates } : s)))
  }

  const handleSaveWeekly = async () => {
    setSaving(true)
    const formattedData = scheduleState.map(s => ({
      dayOfWeek: s.day,
      startTime: s.start,
      endTime: s.end,
      isActive: s.enabled
    }))

    const result = await updateAvailabilityAction(formattedData)

    if (result.error) toast.error(`Error: ${result.error}`)
    else toast.success("Weekly Hours Saved Successfully!")
    
    setSaving(false)
  }

  const handleAddOverride = async () => {
    if (!newOverrideDate) return toast.error("Please select a date")

    const result = await addDateOverrideAction({
      date: newOverrideDate,
      startTime: overrideStart,
      endTime: overrideEnd,
      isUnavailable
    })

    if (result.success) {
      toast.success("Date override added!")
      setNewOverrideDate('')
      setIsUnavailable(false)
      router.refresh() // Pull the fresh list from the server
    } else {
      toast.error(result.error || "Failed to add override")
    }
  }

  const handleRemoveOverride = async (id: string) => {
    // Optimistic UI Removal
    setOverrides((prev) => prev.filter((o) => o.id !== id))
    
    const result = await deleteDateOverrideAction(id)
    if (result.error) {
      toast.error("Failed to delete override")
      router.refresh() // Revert UI if it failed
    } else {
      toast.success("Override removed")
    }
  }

  return (
    <div className="space-y-6">
      
      {/* TIMEZONE CARD */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Timezone</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={timezone} onValueChange={handleTimezoneChange}>
            <SelectTrigger className="w-full max-w-xs bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* WEEKLY HOURS CARD */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Working hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scheduleState.map((schedule) => (
            <div key={schedule.day} className="flex flex-col sm:flex-row sm:items-center gap-4 py-3 border-b border-border last:border-0">
              <div className="w-32 flex items-center gap-3">
                <Switch checked={schedule.enabled} onCheckedChange={(checked) => updateSchedule(schedule.day, { enabled: checked })} />
                <Label className="text-sm font-medium">{DAYS_OF_WEEK[schedule.day]}</Label>
              </div>

              {schedule.enabled ? (
                <div className="flex items-center gap-2 flex-1">
                  <Select value={schedule.start} onValueChange={(value) => updateSchedule(schedule.day, { start: value })}>
                    <SelectTrigger className="w-28 bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">-</span>
                  <Select value={schedule.end} onValueChange={(value) => updateSchedule(schedule.day, { end: value })}>
                    <SelectTrigger className="w-28 bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <span className="text-muted-foreground text-sm flex-1">Unavailable</span>
              )}
            </div>
          ))}

          <Button onClick={handleSaveWeekly} disabled={saving} className="mt-6 w-full sm:w-auto">
            {saving ? 'Saving...' : 'Save Weekly Hours'}
          </Button>
        </CardContent>
      </Card>

      {/* DATE OVERRIDES CARD */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Date overrides
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Add specific dates when your availability changes from your weekly hours.</p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-lg border border-border">
            <Input 
              type="date" 
              value={newOverrideDate} 
              onChange={(e) => setNewOverrideDate(e.target.value)} 
              className="w-full sm:w-48 bg-background" 
            />
            
            <div className="flex items-center gap-2">
              <Switch checked={isUnavailable} onCheckedChange={setIsUnavailable} />
              <Label className="text-sm whitespace-nowrap">Unavailable all day</Label>
            </div>

            {!isUnavailable && (
              <div className="flex items-center gap-2">
                <Select value={overrideStart} onValueChange={setOverrideStart}>
                  <SelectTrigger className="w-24 bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">-</span>
                <Select value={overrideEnd} onValueChange={setOverrideEnd}>
                  <SelectTrigger className="w-24 bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button onClick={handleAddOverride} size="sm" variant="default" className="w-full sm:w-auto mt-2 sm:mt-0">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          {overrides.length > 0 && (
            <div className="space-y-2 mt-6">
              {overrides.map((override) => {
                // Formatting the date correctly
                const dateObj = new Date(override.date);
                const displayDate = isNaN(dateObj.getTime()) 
                  ? String(override.date) 
                  : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

                return (
                  <div key={override.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 bg-background rounded-md border border-border shadow-sm">
                    <span className="text-sm font-medium mb-2 sm:mb-0">
                      {displayDate}
                    </span>
                    <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
                      {override.isUnavailable ? (
                        <span className="text-sm font-medium text-destructive bg-destructive/10 px-2 py-1 rounded">
                          Unavailable
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground font-medium bg-muted px-2 py-1 rounded">
                          {override.startTime} - {override.endTime}
                        </span>
                      )}
                      <Button size="icon" variant="ghost" onClick={() => handleRemoveOverride(override.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}