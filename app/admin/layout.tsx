'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabaseClient'
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  Award,
  LogOut,
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkAdmin = async () => {
      if (!loading && !user) {
        router.push('/login')
        return
      }

      if (user) {
        // Check if user is a club admin
        const { data } = await supabase
          .from('club_admins')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true)
          .single()

        if (!data) {
          router.push('/member')
        } else {
          setIsAdmin(true)
        }
      }
    }

    checkAdmin()
  }, [user, loading, router])

  if (loading || !isAdmin) {
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
          <p className="text-sm text-gray-500">Admin Dashboard</p>
        </div>

        <nav className="space-y-2">
          <Link
            href="/admin"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/members"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <Users className="h-5 w-5" />
            <span>Members</span>
          </Link>

          <Link
            href="/admin/meetings"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <Calendar className="h-5 w-5" />
            <span>Meetings</span>
          </Link>

          <Link
            href="/admin/approvals"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <CheckSquare className="h-5 w-5" />
            <span>Approvals</span>
          </Link>

          <Link
            href="/admin/certificates"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <Award className="h-5 w-5" />
            <span>Certificates</span>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Link href="/member">
            <Button variant="ghost" className="w-full mb-2">
              Member View
            </Button>
          </Link>
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