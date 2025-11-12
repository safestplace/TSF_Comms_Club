import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabaseServer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { Star, Award } from 'lucide-react'

export default async function MembersPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's club
  const { data: membership } = await supabase
    .from('club_members')
    .select('club_id')
    .eq('user_id', user.id)
    .eq('status', 'approved')
    .single()

  if (!membership) return null

  // Get all approved members with their role counts
  const { data: members } = await supabase
    .from('club_members')
    .select(`
      *,
      users(name, email)
    `)
    .eq('club_id', membership.club_id)
    .eq('status', 'approved')
    .order('joined_at', { ascending: true })

  // Get role requests for members to show badges
  const { data: roleRequests } = await supabase
    .from('role_requests')
    .select('user_id, roles(name)')
    .eq('status', 'approved')
    .in('meeting_id', 
      supabase
        .from('meetings')
        .select('id')
        .eq('club_id', membership.club_id)
    )

  // Count roles per member
  const memberRoleCounts = roleRequests?.reduce((acc: any, rr) => {
    acc[rr.user_id] = (acc[rr.user_id] || 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Club Members</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Members ({members?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles Played</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{member.users.name}</span>
                      {member.is_organizer && (
                        <Star className="h-4 w-4 text-warning-500 fill-warning-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {member.users.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="info">
                      <Award className="h-3 w-3 mr-1" />
                      {memberRoleCounts?.[member.user_id] || 0} roles
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.is_organizer ? (
                      <Badge variant="warning">Organizer</Badge>
                    ) : (
                      <Badge variant="default">Member</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(member.joined_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!members || members.length === 0 && (
            <p className="text-center text-gray-500 py-8">No members found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}