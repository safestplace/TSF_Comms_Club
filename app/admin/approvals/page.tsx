'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { Check, X } from 'lucide-react'

type AdminRecord = {
  club_id: number
  user_id: string
  active: boolean
}

export default function AdminApprovalsPage() {
  const [roleRequests, setRoleRequests] = useState<any[]>([])
  const [achievementRequests, setAchievementRequests] = useState<any[]>([])
  const [clubId, setClubId] = useState<number | null>(null)
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
    const { data } = await supabase
      .from('club_admins')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .single()

    const adminRecord = data as AdminRecord | null

    if (!adminRecord) return

    setClubId(adminRecord.club_id)

    // Get pending role requests
    const { data: roleRequestsData } = await supabase
      .from('role_requests')
      .select(`
        *,
        users(name, email),
        roles(name),
        meetings(title, scheduled_at)
      `)
      .eq('status', 'pending')

    // Filter role requests for this club's meetings
    const { data: clubMeetings } = await supabase
      .from('meetings')
      .select('id')
      .eq('club_id', adminRecord.club_id)

    const meetingIds = (clubMeetings as any[])?.map((m: any) => m.id) || []

    const filteredRoleRequests = (roleRequestsData as any[])?.filter((rr: any) =>
      meetingIds.includes(rr.meeting_id)
    )

    setRoleRequests(filteredRoleRequests || [])

    // Get pending achievement requests
    const { data: achievementRequestsData } = await supabase
      .from('achievement_requests')
      .select(`
        *,
        users(name, email),
        levels(number, title, club_id),
        meetings(title)
      `)
      .eq('status', 'pending')

    const filteredAchievementRequests = (achievementRequestsData as any[])?.filter(
      (ar: any) => ar.levels.club_id === adminRecord.club_id
    )

    setAchievementRequests(filteredAchievementRequests || [])
    setLoading(false)
  }

  const approveRoleRequest = async (requestId: number, userId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await (supabase
      .from('role_requests') as any)
      .update({
        status: 'approved',
        decided_by: user.id,
        decided_at: new Date().toISOString(),
      })
      .eq('id', requestId)

    if (!error) {
      // Create notification
      await (supabase.from('notifications') as any).insert({
        user_id: userId,
        type: 'role_approved',
        message: 'Your role request has been approved!',
        channel: 'in_app',
      })
      fetchData()
    }
  }

  const rejectRoleRequest = async (requestId: number, userId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await (supabase
      .from('role_requests') as any)
      .update({
        status: 'rejected',
        decided_by: user.id,
        decided_at: new Date().toISOString(),
      })
      .eq('id', requestId)

    if (!error) {
      await (supabase.from('notifications') as any).insert({
        user_id: userId,
        type: 'role_rejected',
        message: 'Your role request was not approved.',
        channel: 'in_app',
      })
      fetchData()
    }
  }

  const approveAchievement = async (requestId: number, userId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await (supabase
      .from('achievement_requests') as any)
      .update({
        status: 'approved',
        decided_by: user.id,
        decided_at: new Date().toISOString(),
      })
      .eq('id', requestId)

    if (!error) {
      await (supabase.from('notifications') as any).insert({
        user_id: userId,
        type: 'achievement_approved',
        message: 'Your achievement has been approved! Certificate will be generated.',
        channel: 'in_app',
      })
      fetchData()
    }
  }

  const rejectAchievement = async (requestId: number, userId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await (supabase
      .from('achievement_requests') as any)
      .update({
        status: 'rejected',
        decided_by: user.id,
        decided_at: new Date().toISOString(),
      })
      .eq('id', requestId)

    if (!error) {
      await (supabase.from('notifications') as any).insert({
        user_id: userId,
        type: 'achievement_rejected',
        message: 'Your achievement request was not approved.',
        channel: 'in_app',
      })
      fetchData()
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Approvals</h1>

      {/* Role Requests */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pending Role Requests ({roleRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {roleRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Meeting</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roleRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.users.name}</p>
                        <p className="text-xs text-gray-500">{request.users.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.meetings.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.meetings.scheduled_at).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{request.roles.name}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => approveRoleRequest(request.id, request.user_id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => rejectRoleRequest(request.id, request.user_id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 py-8">No pending role requests</p>
          )}
        </CardContent>
      </Card>

      {/* Achievement Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Achievement Requests ({achievementRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {achievementRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Meeting</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {achievementRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.users.name}</p>
                        <p className="text-xs text-gray-500">{request.users.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="warning">
                        Level {request.levels.number}: {request.levels.title}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{request.meetings.title}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {request.notes || 'No notes'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => approveAchievement(request.id, request.user_id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => rejectAchievement(request.id, request.user_id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 py-8">No pending achievement requests</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
