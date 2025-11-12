'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { roleRequestSchema } from '@/lib/validations/schemas'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabaseClient'
import { z } from 'zod'

type RoleRequestFormData = z.infer<typeof roleRequestSchema>

interface RoleRequestFormProps {
  meetingId: number
  clubId: number
  onSuccess: () => void
}

export function RoleRequestForm({ meetingId, clubId, onSuccess }: RoleRequestFormProps) {
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleRequestFormData>({
    resolver: zodResolver(roleRequestSchema),
  })

  useEffect(() => {
    const fetchRoles = async () => {
      const { data } = await supabase
        .from('roles')
        .select('*')
        .eq('club_id', clubId)
        .order('name')
      if (data) setRoles(data)
    }
    fetchRoles()
  }, [clubId])

  const onSubmit = async (data: RoleRequestFormData) => {
    setLoading(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error: insertError } = await (supabase.from('role_requests') as any).insert({
      meeting_id: meetingId,
      user_id: user.id,
      role_id: data.role_id,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-800 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
        <select
          {...register('role_id', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Choose a role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name} - {role.description}
            </option>
          ))}
        </select>
        {errors.role_id && (
          <p className="mt-1 text-sm text-error-600">{errors.role_id.message}</p>
        )}
      </div>

      <p className="text-xs text-gray-500">
        You can request one role per meeting. Your request will be reviewed by the club admin.
      </p>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Submitting...' : 'Request Role'}
      </Button>
    </form>
  )
}
