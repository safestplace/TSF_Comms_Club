import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Users, Calendar, Clock, CheckCircle } from 'lucide-react'

export default async function AdminDashboard() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get admin's club
  const { data: adminRecord } = await supabase
    .from('club_admins')
    .select('club_id, clubs(*)')
    .eq('user_id', user.id)
    .eq('active', true)
    .single()

  if (!adminRecord) {
    redirect('/member')
  }

  const clubId = adminRecord.club_id

  // Get club stats
  const { count: membersCount } = await supabase
    .from('club_members')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', clubId)
    .eq('status', 'approved')

  const { count: organizersCount } = await supabase
    .from('club_members')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', clubId)
    .eq('status', 'approved')
    .eq('is_organizer', true)

  const { count: meetingsCount } = await supabase
    .from('meetings')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', clubId)

  const { count: pendingMembersCount } = await supabase
    .from('club_members')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', clubId)
    .eq('status', 'pending')

  const { count: pendingRoleRequestsCount } = await supabase
    .from('role_requests')
    .select('*, meetings!inner(club_id)', { count: 'exact', head: true })
    .eq('meetings.club_id', clubId)
    .eq('status', 'pending')

  const { count: pendingAchievementsCount } = await supabase
    .from('achievement_requests')
    .select('*, levels!inner(club_id)', { count: 'exact', head: true })
    .eq('levels.club_id', clubId)
    .eq('status', 'pending')

  const totalPendingApprovals =
    (pendingMembersCount || 0) +
    (pendingRoleRequestsCount || 0) +
    (pendingAchievementsCount || 0)

  // Get recent activity
  const { data: recentMeetings } = await supabase
    .from('meetings')
    .select('*')
    .eq('club_id', clubId)
    .order('scheduled_at', { ascending: false })
    .limit(5)

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">{adminRecord.clubs.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-3xl font-bold text-primary-600">
                  {membersCount || 0}
                </p>
              </div>
              <Users className="h-10 w-10 text-primary-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Organizers</p>
                <p className="text-3xl font-bold text-success-600">
                  {organizersCount || 0}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-success-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Meetings</p>
                <p className="text-3xl font-bold text-warning-600">
                  {meetingsCount || 0}
                </p>
              </div>
              <Calendar className="h-10 w-10 text-warning-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-3xl font-bold text-error-600">
                  {totalPendingApprovals}
                </p>
              </div>
              <Clock className="h-10 w-10 text-error-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizer Cap Warning */}
      {membersCount && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Organizer Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Current: {organizersCount || 0} / Maximum: {Math.floor((membersCount || 0) / 20) * 5}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-success-600"
                    style={{
                      width: `${Math.min(
                        ((organizersCount || 0) / (Math.floor((membersCount || 0) / 20) * 5 || 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              You can assign up to 5 organizers per 20 approved members
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Meetings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          {recentMeetings && recentMeetings.length > 0 ? (
            <div className="space-y-3">
              {recentMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{meeting.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(meeting.scheduled_at).toLocaleDateString()} • {meeting.venue}
                    </p>
                  </div>
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No meetings yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}