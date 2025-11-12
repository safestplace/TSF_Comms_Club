'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clubRequestSchema } from '@/lib/validations/schemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabaseClient'
import { z } from 'zod'

type ClubRequestFormData = z.infer<typeof clubRequestSchema>

interface ClubRequestFormProps {
  onSuccess: () => void
}

export function ClubRequestForm({ onSuccess }: ClubRequestFormProps) {
  const [states, setStates] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedState, setSelectedState] = useState<number | null>(null)

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ClubRequestFormData>({
    resolver: zodResolver(clubRequestSchema),
  })

  const stateId = watch('state_id')

  useEffect(() => {
    const fetchStates = async () => {
      const { data } = await supabase.from('states').select('*').order('name')
      if (data) setStates(data)
    }
    fetchStates()
  }, [])

  useEffect(() => {
    if (stateId) {
      const fetchDistricts = async () => {
        const { data } = await supabase
          .from('districts')
          .select('*')
          .eq('state_id', stateId)
          .order('name')
        if (data) setDistricts(data)
      }
      fetchDistricts()
      setValue('district_id', 0)
    }
  }, [stateId])

  const onSubmit = async (data: ClubRequestFormData) => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from('club_requests').insert({
      requested_by_user: user.id,
      club_name: data.club_name,
      state_id: data.state_id,
      district_id: data.district_id,
      institution_text: data.institution_text,
    })

    setLoading(false)

    if (!error) {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Club Name"
        {...register('club_name')}
        error={errors.club_name?.message}
        placeholder="Communication Excellence Club"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
        <select
          {...register('state_id', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select a state</option>
          {states.map((state) => (
            <option key={state.id} value={state.id}>
              {state.name}
            </option>
          ))}
        </select>
        {errors.state_id && <p className="mt-1 text-sm text-error-600">{errors.state_id.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
        <select
          {...register('district_id', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          disabled={!stateId}
        >
          <option value="">Select a district</option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
        {errors.district_id && (
          <p className="mt-1 text-sm text-error-600">{errors.district_id.message}</p>
        )}
      </div>

      <Input
        label="Institution Name"
        {...register('institution_text')}
        error={errors.institution_text?.message}
        placeholder="Your college/university name"
      />

      <p className="text-xs text-gray-500">
        If your institution is not in our list, type the name and it will be submitted for approval.
      </p>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Club Request'}
      </Button>
    </form>
  )
}