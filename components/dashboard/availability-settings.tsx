'use client'

import { useState } from 'react'
import { Availability, AvailabilitySchedule, DateOverride, DAYS_OF_WEEK, TIMEZONES } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { updateAvailabilityAction } from '@/lib/actions'
import { toast } from "sonner"

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
  const [saving, setSaving] = useState(false)
  const [timezone, setTimezone] = useState(availability?.timezone || 'Asia/Kolkata')

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
  const [overrides, setOverrides] = useState<DateOverride[]>(dateOverrides)
  const [newOverrideDate, setNewOverrideDate] = useState('')

  const updateSchedule = (dayIndex: number, updates: Partial<ScheduleState>) => {
    setScheduleState((prev) => prev.map((s) => (s.day === dayIndex ? { ...s, ...updates } : s)))
  }

  const handleSave = async () => {
    setSaving(true)
    
    // Format our local state to match what the Server Action expects
    const formattedData = scheduleState.map(s => ({
      dayOfWeek: s.day,
      startTime: s.start,
      endTime: s.end,
      isActive: s.enabled
    }))

    const result = await updateAvailabilityAction(formattedData)

    if (result.error) {
      alert(`Error: ${result.error}`)
    } else {
      toast.success("Availability Settings Saved Successfully!")
    }
    
    setSaving(false)
  }

  const addDateOverride = () => {
    if (!newOverrideDate) return
    const newOverride = {
      id: Math.random().toString(),
      date: newOverrideDate,
      is_available: false,
    }
    setOverrides((prev) => [...prev, newOverride])
    setNewOverrideDate('')
  }

  const removeOverride = (id: string) => {
    setOverrides((prev) => prev.filter((o) => o.id !== id))
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Timezone</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={timezone} onValueChange={setTimezone}>
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

          <Button onClick={handleSave} disabled={saving} className="mt-6 w-full sm:w-auto">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Date overrides
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Add dates when your availability changes from your daily hours.</p>

          <div className="flex items-center gap-2">
            <Input 
              type="date" 
              value={newOverrideDate} 
              onChange={(e) => setNewOverrideDate(e.target.value)} 
              className="w-48 bg-background" 
            />
            <Button onClick={addDateOverride} size="sm" variant="outline" className="bg-background">
              <Plus className="h-4 w-4 mr-1" /> Add an override
            </Button>
          </div>

          {overrides.length > 0 && (
            <div className="space-y-2 mt-4">
              {overrides.map((override) => (
                <div key={override.id} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md border border-border">
                  <span className="text-sm">
                    {new Date(override.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{override.is_available ? 'Custom hours' : 'Blocked'}</span>
                    <Button size="icon" variant="ghost" onClick={() => removeOverride(override.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}