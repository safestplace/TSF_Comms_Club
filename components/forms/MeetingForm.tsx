'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { meetingSchema } from '@/lib/validations/schemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabaseClient'
import { z } from 'zod'

type MeetingFormData = z.infer<typeof meetingSchema>

interface MeetingFormProps {
  clubId: number
  onSuccess: () => void
  initialData?: any
}

export function MeetingForm({ clubId, onSuccess, initialData }: MeetingFormProps) {
  const [levels, setLevels] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: initialData || {},
  })

  useEffect(() => {
    const fetchLevels = async () => {
      const { data } = await supabase
        .from('levels')
        .select('*')
        .eq('club_id', clubId)
        .order('number')
      if (data) setLevels(data)
    }
    fetchLevels()
  }, [clubId])

  const onSubmit = async (data: MeetingFormData) => {
    setLoading(true)

    if (initialData) {
      // Update existing meeting
      const { error } = await (supabase
        .from('meetings') as any)
        .update({
          title: data.title,
          level_id: data.level_id,
          scheduled_at: data.scheduled_at,
          venue: data.venue,
          notes: data.notes,
        })
        .eq('id', initialData.id)

      if (!error) onSuccess()
    } else {
      // Create new meeting
      const { error } = await (supabase.from('meetings') as any).insert({
        club_id: clubId,
        title: data.title,
        level_id: data.level_id,
        scheduled_at: data.scheduled_at,
        venue: data.venue,
        notes: data.notes,
      })

      if (!error) onSuccess()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Meeting Title"
        {...register('title')}
        error={errors.title?.message}
        placeholder="Weekly Meeting #15"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
        <select
          {...register('level_id', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select a level</option>
          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              Level {level.number}: {level.title}
            </option>
          ))}
        </select>
        {errors.level_id && (
          <p className="mt-1 text-sm text-error-600">{errors.level_id.message}</p>
        )}
      </div>

      <Input
        label="Scheduled Date & Time"
        type="datetime-local"
        {...register('scheduled_at')}
        error={errors.scheduled_at?.message}
      />

      <Input
        label="Venue"
        {...register('venue')}
        error={errors.venue?.message}
        placeholder="Main Auditorium"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
        <textarea
          {...register('notes')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
          placeholder="Additional meeting information..."
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : initialData ? 'Update Meeting' : 'Create Meeting'}
      </Button>
    </form>
  )
}
