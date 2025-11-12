import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'
import { Trophy, Calendar, Award, Bell } from 'lucide-react'

export default async function MemberDashboard() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's club membership
  const { data: membership } = await supabase
    .from('club_members')
    .select('*, clubs(*)')
    .eq('user_id', user.id)
    .eq('status', 'approved')
    .single()

  if (!membership) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Welcome to ClubPortal!</h1>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">
              You're not a member of any club yet.
            </p>
            <p className="text-sm text-gray-500">
              Ask your club admin to add you, or create a new club request.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const clubId = (membership as any).club_id

  // Get achievements count
  const { count: achievementsCount } = await supabase
    .from('achievement_requests')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'approved')

  // Get upcoming meetings
  const { data: upcomingMeetings } = await supabase
    .from('meetings')
    .select('*')
    .eq('club_id', clubId)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at')
    .limit(3)

  // Get recent notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get certificates count
  const { count: certificatesCount } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Determine current level (based on achievements)
  const currentLevel = Math.min(Math.floor((achievementsCount || 0) / 3) + 1, 4)

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back!
        </h1>
        <p className="text-gray-600">
          {(membership as any).clubs.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Level</p>
                <p className="text-3xl font-bold text-primary-600">
                  {currentLevel}
                </p>
              </div>
              <Trophy className="h-10 w-10 text-primary-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Achievements</p>
                <p className="text-3xl font-bold text-success-600">
                  {achievementsCount || 0}
                </p>
              </div>
              <Award className="h-10 w-10 text-success-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Certificates</p>
                <p className="text-3xl font-bold text-warning-600">
                  {certificatesCount || 0}
                </p>
              </div>
              <Award className="h-10 w-10 text-warning-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Notifications</p>
                <p className="text-3xl font-bold text-error-600">
                  {(notifications as any[])?.filter((n: any) => !n.read_at).length || 0}
                </p>
              </div>
              <Bell className="h-10 w-10 text-error-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Level Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((level) => (
              <div key={level}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Level {level}</span>
                  <span className="text-sm text-gray-500">
                    {level <= currentLevel ? 'Completed' : 'Locked'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      level <= currentLevel ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                    style={{
                      width: level <= currentLevel ? '100%' : '0%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Meetings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upcoming Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingMeetings && upcomingMeetings.length > 0 ? (
            <div className="space-y-4">
              {(upcomingMeetings as any[]).map((meeting: any) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{meeting.title}</h4>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(meeting.scheduled_at)} • {meeting.venue}
                    </p>
                  </div>
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No upcoming meetings scheduled
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications && notifications.length > 0 ? (
            <div className="space-y-3">
              {(notifications as any[]).map((notification: any) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg ${
                    notification.read_at ? 'bg-gray-50' : 'bg-primary-50'
                  }`}
                >
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(notification.created_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No notifications</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
