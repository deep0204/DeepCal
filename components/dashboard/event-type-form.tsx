'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { createEventTypeAction, updateEventTypeAction } from '@/lib/actions'
import { EventType } from '@/lib/types' 
import { toast } from 'sonner' // Added the modern toast!

const DURATIONS = [15, 30, 45, 60, 90, 120]
const EVENT_COLORS = ['#ffffff', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']

export function EventTypeForm({ initialData }: { initialData?: EventType }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [duration, setDuration] = useState(initialData?.duration || 30)
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [color, setColor] = useState(initialData?.color || EVENT_COLORS[0])
  
  // Using a single buffer time that applies to the force field (Before & After)
  const [bufferTime, setBufferTime] = useState(initialData?.bufferTime || 0)

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    // Auto-generate slug from title if it's a new event
    if (!initialData) {
      setSlug(generateSlug(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Pack all the data, INCLUDING bufferTime!
    const payload = { title, description, duration, slug, color, bufferTime }

    let result;

    // If we have initialData, we are EDITING. Otherwise, CREATING.
    if (initialData) {
      result = await updateEventTypeAction(initialData.id, payload)
    } else {
      result = await createEventTypeAction(payload)
    }

    if (result.error) {
      toast.error(result.error) // Upgraded to toast
      setLoading(false)
      return
    }

    toast.success(initialData ? "Event type updated!" : "Event type created!")
    router.refresh()
    router.push('/dashboard/event-types')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Quick Chat"
              className="bg-background"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief meeting to discuss..."
              className="bg-background"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <div className="flex items-center">
              <span className="text-muted-foreground text-sm mr-2 font-mono">deepcal/</span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                placeholder="quick-chat"
                className="bg-background"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d} value={d.toString()}>{d} minutes</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Color Identifier</Label>
            <div className="flex gap-2 pt-1">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all border border-border',
                    color === c && 'ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Buffer Time (Bonus Feature)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bufferTime">Rest time before & after meeting</Label>
            <Select value={bufferTime.toString()} onValueChange={(v) => setBufferTime(parseInt(v))}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No buffer</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[0.8rem] text-muted-foreground mt-2">
              Creates a protective gap around your meetings so nobody can book back-to-back.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 bg-background">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : initialData ? 'Update Event Type' : 'Create Event Type'}
        </Button>
      </div>
    </form>
  )
}