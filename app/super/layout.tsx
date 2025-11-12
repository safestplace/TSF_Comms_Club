'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabaseClient'
import {
  CheckSquare,
  MapPin,
  BarChart3,
  LogOut,
  User,
} from 'lucide-react'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (!loading && !user) {
        router.push('/login')
        return
      }

      if (user) {
        // Check if user is super admin
        const { data } = await supabase
          .from('users')
          .select('global_role')
          .eq('id', user.id)
          .single()

        if ((data as any)?.global_role !== 'super') {
          router.push('/member')
        } else {
          setIsSuperAdmin(true)
        }
      }
    }

    checkSuperAdmin()
  }, [user, loading, router])

  if (loading || !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900">ClubPortal</h2>
          <p className="text-sm text-gray-500">Super Admin</p>
        </div>

        <nav className="space-y-2">
          <Link
            href="/super/approvals"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <CheckSquare className="h-5 w-5" />
            <span>Approvals</span>
          </Link>

          <Link
            href="/super/locations"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <MapPin className="h-5 w-5" />
            <span>Locations</span>
          </Link>

          <Link
            href="/super/insights"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Insights</span>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">{children}</main>
    </div>
  )
}
