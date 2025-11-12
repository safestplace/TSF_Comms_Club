'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'
import { RoleRequestForm } from '@/components/forms/RoleRequestForm'
import { Calendar } from 'lucide-react'

export default function MemberActivityPage() {
  const [meetings, setMeetings] = useState<any[]>([])
  const [clubId, setClubId] = useState<number | null>(null)
  const [selectedMeeting, setSelectedMeeting] = useState<number | null>(null)
  const [roleRequests, setRoleRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Get user's club
    const { data: membership } = await supabase
      .from('club_members')
      .select('club_id')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .single()

    if (membership) {
      setClubId(membership.club_id)

      // Get meetings
      const { data: meetingsData } = await supabase
        .from('meetings')
        .select('*, levels(*)')
        .eq('club_id', membership.club_id)
        .order('scheduled_at', { ascending: false })

      setMeetings(meetingsData || [])

      // Get user's role requests
      const { data: requestsData } = await supabase
        .from('role_requests')
        .select('*, roles(*), meetings(*)')
        .eq('user_id', user.id)

      setRoleRequests(requestsData || [])
    }

    setLoading(false)
  }

  const getUserRoleForMeeting = (meetingId: number) => {
    return roleRequests.find((rr) => rr.meeting_id === meetingId)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Meeting Activity</h1>

      {selectedMeeting && clubId && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Request a Role</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMeeting(null)}
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <RoleRequestForm
              meetingId={selectedMeeting}
              clubId={clubId}
              onSuccess={() => {
                setSelectedMeeting(null)
                fetchData()
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {meetings.map((meeting) => {
          const userRole = getUserRoleForMeeting(meeting.id)

          return (
            <Card key={meeting.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <h3 className="text-lg font-semibold">{meeting.title}</h3>
                      <Badge variant="info">
                        Level {meeting.levels.number}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatDateTime(meeting.scheduled_at)} • {meeting.venue}
                    </p>
                    {meeting.notes && (
                      <p className="text-sm text-gray-500">{meeting.notes}</p>
                    )}

                    {userRole && (
                      <div className="mt-3">
                        <Badge
                          variant={
                            userRole.status === 'approved'
                              ? 'success'
                              : userRole.status === 'rejected'
                              ? 'error'
                              : 'warning'
                          }
                        >
                          Role: {userRole.roles.name} ({userRole.status})
                        </Badge>
                      </div>
                    )}
                  </div>

                  {!userRole && (
                    <Button
                      size="sm"
                      onClick={() => setSelectedMeeting(meeting.id)}
                    >
                      Request Role
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {meetings.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No meetings available yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}