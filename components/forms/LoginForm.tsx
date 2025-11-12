'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/validations/schemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // Get user role and redirect
    const { data: userData } = await supabase
      .from('users')
      .select('global_role')
      .eq('email', data.email)
      .single()

    if (userData) {
      if ((userData as any).global_role === 'super') {
        router.push('/super/approvals')
      } else if ((userData as any).global_role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/member')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Input
        variant="compact"
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        placeholder="you@example.com"
      />

      <Input
        variant="compact"
        label="Password"
        type="password"
        {...register('password')}
        error={errors.password?.message}
        placeholder="••••••••"
      />

      <Button type="submit" className="w-full mt-2" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}
