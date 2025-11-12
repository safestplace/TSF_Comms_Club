'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import {
  Home,
  Calendar,
  Trophy,
  Users,
  Award,
  Bell,
  LogOut,
} from 'lucide-react'

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900">ClubPortal</h2>
          <p className="text-sm text-gray-500">Member Dashboard</p>
        </div>

        <nav className="space-y-2">
          <Link
            href="/member"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/member/activity"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <Calendar className="h-5 w-5" />
            <span>Meetings</span>
          </Link>

          <Link
            href="/member/leaderboard"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <Trophy className="h-5 w-5" />
            <span>Leaderboard</span>
          </Link>

          <Link
            href="/member/members"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <Users className="h-5 w-5" />
            <span>Members</span>
          </Link>

          <Link
            href="/member/certificates"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <Award className="h-5 w-5" />
            <span>Certificates</span>
          </Link>

          <Link
            href="/member/notifications"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
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