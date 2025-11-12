'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from '@/lib/validations/schemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    
    // Sign up with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      // Create user profile
      const { error: profileError } = await (supabase.from('users') as any).insert({
        id: authData.user.id,
        name: data.name,
        email: data.email,
        global_role: 'member',
      })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      router.push('/member')
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
        label="Full Name"
        {...register('name')}
        error={errors.name?.message}
        placeholder="John Doe"
      />

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

      <Input
        variant="compact"
        label="Confirm Password"
        type="password"
        {...register('confirmPassword')}
        error={errors.confirmPassword?.message}
        placeholder="••••••••"
      />

      <Button type="submit" className="w-full mt-2" disabled={loading}>
        {loading ? 'Creating account...' : 'Register'}
      </Button>
    </form>
  )
}
