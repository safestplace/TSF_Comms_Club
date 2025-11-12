import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabaseServer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'

export default async function InsightsPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get all clubs with activity data
  const { data: clubActivity } = await supabase
    .from('v_club_activity')
    .select('*, clubs(name, slug, states(name), districts(name))')

  // Get total stats
  const { count: totalClubs } = await supabase
    .from('clubs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { count: totalMembers } = await supabase
    .from('club_members')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { count: totalMeetings } = await supabase
    .from('meetings')
    .select('*', { count: 'exact', head: true })

  const { count: totalCertificates } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Platform Insights</h1>

      {/* Global Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Clubs</p>
            <p className="text-3xl font-bold text-primary-600">{totalClubs || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Members</p>
            <p className="text-3xl font-bold text-success-600">{totalMembers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Meetings</p>
            <p className="text-3xl font-bold text-warning-600">{totalMeetings || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Certificates Issued</p>
            <p className="text-3xl font-bold text-error-600">{totalCertificates || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Club Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Club Activity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Club Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Meetings</TableHead>
                <TableHead>Pending Approvals</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubActivity?.map((activity: any) => (
                <TableRow key={activity.club_id}>
                  <TableCell className="font-medium">{activity.clubs.name}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{activity.clubs.states.name}</p>
                      <p className="text-xs text-gray-500">
                        {activity.clubs.districts.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info">{activity.members_count} members</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{activity.meetings_count} meetings</Badge>
                  </TableCell>
                  <TableCell>
                    {activity.pending_approvals > 0 ? (
                      <Badge variant="warning">{activity.pending_approvals} pending</Badge>
                    ) : (
                      <Badge variant="success">None</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!clubActivity || clubActivity.length === 0 && (
            <p className="text-center text-gray-500 py-8">No clubs data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}