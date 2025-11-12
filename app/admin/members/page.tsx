'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { calculateOrganizerCap } from '@/lib/utils'
import { Check, X, Star } from 'lucide-react'

export default function AdminMembersPage() {
  const [members, setMembers] = useState<any[]>([])
  const [pendingMembers, setPendingMembers] = useState<any[]>([])
  const [clubId, setClubId] = useState<number | null>(null)
  const [approvedCount, setApprovedCount] = useState(0)
  const [organizerCount, setOrganizerCount] = useState(0)
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

    setClubId(adminRecord.club_id)

    // Get approved members
    const { data: approvedMembers, count: approvedCnt } = await supabase
      .from('club_members')
      .select('*, users(name, email)', { count: 'exact' })
      .eq('club_id', adminRecord.club_id)
      .eq('status', 'approved')
      .order('joined_at', { ascending: true })

    setMembers(approvedMembers || [])
    setApprovedCount(approvedCnt || 0)

    // Count organizers
    const organizerCnt = approvedMembers?.filter((m) => m.is_organizer).length || 0
    setOrganizerCount(organizerCnt)

    // Get pending members
    const { data: pendingMembersData } = await supabase
      .from('club_members')
      .select('*, users(name, email)')
      .eq('club_id', adminRecord.club_id)
      .eq('status', 'pending')
      .order('joined_at', { ascending: true })

    setPendingMembers(pendingMembersData || [])
    setLoading(false)
  }

  const approveMember = async (memberId: number) => {
    const { error } = await supabase
      .from('club_members')
      .update({ status: 'approved' })
      .eq('id', memberId)

    if (!error) {
      // Create notification
      const member = pendingMembers.find((m) => m.id === memberId)
      if (member) {
        await supabase.from('notifications').insert({
          user_id: member.user_id,
          type: 'member_approved',
          message: 'Your club membership has been approved!',
          channel: 'in_app',
        })
      }
      fetchData()
    }
  }

  const rejectMember = async (memberId: number) => {
    const { error } = await supabase
      .from('club_members')
      .update({ status: 'rejected' })
      .eq('id', memberId)

    if (!error) fetchData()
  }

  const toggleOrganizer = async (memberId: number, currentStatus: boolean) => {
    const maxOrganizers = calculateOrganizerCap(approvedCount)

    if (!currentStatus && organizerCount >= maxOrganizers) {
      alert(`Maximum ${maxOrganizers} organizers allowed for ${approvedCount} members`)
      return
    }

    const { error } = await supabase
      .from('club_members')
      .update({ is_organizer: !currentStatus })
      .eq('id', memberId)

    if (!error) fetchData()
  }

  const maxOrganizers = calculateOrganizerCap(approvedCount)

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Member Management</h1>

      {/* Organizer Cap Info */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600">
            Organizers: {organizerCount} / {maxOrganizers} (5 per 20 members)
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="h-2 rounded-full bg-primary-600"
              style={{
                width: `${Math.min((organizerCount / (maxOrganizers || 1)) * 100, 100)}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      {pendingMembers.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pending Approvals ({pendingMembers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.users.name}</TableCell>
                    <TableCell>{member.users.email}</TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(member.joined_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => approveMember(member.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => rejectMember(member.id)}
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
          </CardContent>
        </Card>
      )}

      {/* Approved Members */}
      <Card>
        <CardHeader>
          <CardTitle>Approved Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.users.name}</TableCell>
                  <TableCell>{member.users.email}</TableCell>
                  <TableCell>
                    {member.is_organizer ? (
                      <Badge variant="warning">
                        <Star className="h-3 w-3 mr-1" />
                        Organizer
                      </Badge>
                    ) : (
                      <Badge variant="default">Member</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(member.joined_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleOrganizer(member.id, member.is_organizer)}
                    >
                      {member.is_organizer ? 'Remove Organizer' : 'Make Organizer'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}