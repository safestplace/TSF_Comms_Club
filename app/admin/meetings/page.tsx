'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MeetingForm } from '@/components/forms/MeetingForm'
import { formatDateTime } from '@/lib/utils'
import { Plus, Edit, Trash } from 'lucide-react'

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([])
  const [clubId, setClubId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<any>(null)
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

    // Get admin's club
    const { data: adminRecord } = await supabase
      .from('club_admins')
      .select('club_id')
      .eq('user_id', user.id)
      .eq('active', true)
      .single()

    if (!adminRecord) return

    setClubId((adminRecord as any).club_id)

    // Get meetings
    const { data: meetingsData } = await supabase
      .from('meetings')
      .select('*, levels(*)')
      .eq('club_id', (adminRecord as any).club_id)
      .order('scheduled_at', { ascending: false })

    setMeetings(meetingsData || [])
    setLoading(false)
  }

  const deleteMeeting = async (meetingId: number) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return

    const { error } = await supabase.from('meetings').delete().eq('id', meetingId)

    if (!error) fetchData()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meetings</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Meeting
        </Button>
      </div>

      {(showForm || editingMeeting) && clubId && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{editingMeeting ? 'Edit Meeting' : 'Create New Meeting'}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false)
                  setEditingMeeting(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <MeetingForm
              clubId={clubId}
              initialData={editingMeeting}
              onSuccess={() => {
                setShowForm(false)
                setEditingMeeting(null)
                fetchData()
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {meetings.map((meeting) => (
          <Card key={meeting.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{meeting.title}</h3>
                    <Badge variant="info">Level {meeting.levels.number}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {formatDateTime(meeting.scheduled_at)}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">Venue: {meeting.venue}</p>
                  {meeting.notes && (
                    <p className="text-sm text-gray-500 mt-2">{meeting.notes}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingMeeting(meeting)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => deleteMeeting(meeting.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {meetings.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No meetings created yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
