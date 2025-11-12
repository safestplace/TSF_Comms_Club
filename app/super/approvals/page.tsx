'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { Check, X } from 'lucide-react'
import { slugify } from '@/lib/utils'

export default function SuperAdminApprovalsPage() {
  const [clubRequests, setClubRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data } = await supabase
      .from('club_requests')
      .select(`
        *,
        users(name, email),
        states(name),
        districts(name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    setClubRequests(data || [])
    setLoading(false)
  }

  const approveClubRequest = async (request: any) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Check if institution exists, if not create it
    let institutionId = null

    const { data: existingInstitution } = await supabase
      .from('institutions')
      .select('id')
      .eq('district_id', request.district_id)
      .ilike('name', request.institution_text)
      .single()

    if (existingInstitution) {
      institutionId = existingInstitution.id
    } else {
      const { data: newInstitution, error: institutionError } = await supabase
        .from('institutions')
        .insert({
          district_id: request.district_id,
          name: request.institution_text,
          status: 'approved',
        })
        .select()
        .single()

      if (institutionError) {
        alert('Error creating institution')
        return
      }

      institutionId = newInstitution.id
    }

    // Create the club
    const { data: newClub, error: clubError } = await supabase
      .from('clubs')
      .insert({
        name: request.club_name,
        slug: slugify(request.club_name),
        state_id: request.state_id,
        district_id: request.district_id,
        institution_id: institutionId,
        created_by_user: request.requested_by_user,
        status: 'approved',
      })
      .select()
      .single()

    if (clubError) {
      alert('Error creating club')
      return
    }

    // Make the requester a club admin
    await supabase.from('club_admins').insert({
      club_id: newClub.id,
      user_id: request.requested_by_user,
      active: true,
    })

    // Create default levels
    const levels = [
      { number: 1, title: 'Beginner', description: 'Introduction to public speaking' },
      { number: 2, title: 'Intermediate', description: 'Developing speaking skills' },
      { number: 3, title: 'Advanced', description: 'Mastering communication' },
      { number: 4, title: 'Expert', description: 'Leadership and mentorship' },
    ]

    await supabase.from('levels').insert(
      levels.map((level) => ({
        club_id: newClub.id,
        number: level.number,
        title: level.title,
        description: level.description,
      }))
    )

    // Create default roles
    const roles = [
      { name: 'Toastmaster', description: 'Leads the meeting' },
      { name: 'Speaker', description: 'Delivers prepared speech' },
      { name: 'Evaluator', description: 'Evaluates speeches' },
      { name: 'Timer', description: 'Tracks time for all segments' },
      { name: 'Grammarian', description: 'Tracks language usage' },
      { name: 'Table Topics Master', description: 'Leads impromptu speaking' },
      { name: 'General Evaluator', description: 'Evaluates the entire meeting' },
      { name: 'Ah-Counter', description: 'Counts filler words' },
    ]

    await supabase.from('roles').insert(
      roles.map((role) => ({
        club_id: newClub.id,
        name: role.name,
        description: role.description,
      }))
    )

    // Update the club request
    await supabase
      .from('club_requests')
      .update({
        status: 'approved',
        decided_by: user.id,
        decided_at: new Date().toISOString(),
      })
      .eq('id', request.id)

    // Send notification
    await supabase.from('notifications').insert({
      user_id: request.requested_by_user,
      type: 'club_approved',
      message: `Your club "${request.club_name}" has been approved!`,
      channel: 'in_app',
    })

    fetchData()
  }

  const rejectClubRequest = async (requestId: number, userId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('club_requests')
      .update({
        status: 'rejected',
        decided_by: user.id,
        decided_at: new Date().toISOString(),
      })
      .eq('id', requestId)

    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'club_rejected',
      message: 'Your club request was not approved.',
      channel: 'in_app',
    })

    fetchData()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Club Approvals</h1>

      <Card>
        <CardHeader>
          <CardTitle>Pending Club Requests ({clubRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {clubRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Club Name</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clubRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.club_name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.users.name}</p>
                        <p className="text-xs text-gray-500">{request.users.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{request.states.name}</p>
                        <p className="text-xs text-gray-500">{request.districts.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>{request.institution_text}</TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => approveClubRequest(request)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            rejectClubRequest(request.id, request.requested_by_user)
                          }
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
            <p className="text-center text-gray-500 py-8">No pending club requests</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}