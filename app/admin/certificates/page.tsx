'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { Award, Download } from 'lucide-react'

export default function AdminCertificatesPage() {
  const [approvedAchievements, setApprovedAchievements] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [clubId, setClubId] = useState<number | null>(null)
  const [generating, setGenerating] = useState<number | null>(null)
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

    // Get approved achievements without certificates
    const { data: achievementsData } = await supabase
      .from('achievement_requests')
      .select(`
        *,
        users(name, email),
        levels(number, title, club_id)
      `)
      .eq('status', 'approved')

    const filteredAchievements = (achievementsData as any[])?.filter(
      (ar: any) => ar.levels.club_id === (adminRecord as any).club_id
    )

    // Check which achievements already have certificates
    const { data: existingCerts } = await supabase
      .from('certificates')
      .select('*')
      .eq('club_id', (adminRecord as any).club_id)

    const certsMap = new Map(
      existingCerts?.map((c: any) => [`${c.user_id}-${c.level_id}`, c])
    )

    const achievementsWithoutCerts = filteredAchievements?.filter(
      (ar: any) => !certsMap.has(`${ar.user_id}-${ar.level_id}`)
    )

    setApprovedAchievements(achievementsWithoutCerts || [])

    // Get all issued certificates
    const { data: certsData } = await supabase
      .from('certificates')
      .select(`
        *,
        users(name, email),
        levels(number, title)
      `)
      .eq('club_id', (adminRecord as any).club_id)
      .order('issued_at', { ascending: false })

    setCertificates(certsData || [])
    setLoading(false)
  }

  const generateCertificate = async (achievement: any) => {
    if (!clubId) return

    setGenerating(achievement.id)

    try {
      const response = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: achievement.user_id,
          club_id: clubId,
          level_id: achievement.level_id,
        }),
      })

      if (response.ok) {
        await (supabase.from('notifications') as any).insert({
          user_id: achievement.user_id,
          type: 'certificate_issued',
          message: `Your certificate for Level ${achievement.levels.number} has been issued!`,
          channel: 'in_app',
        })
        fetchData()
      } else {
        alert('Failed to generate certificate')
      }
    } catch (error) {
      console.error('Error generating certificate:', error)
      alert('Error generating certificate')
    }

    setGenerating(null)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Certificates</h1>

      {/* Pending Certificate Generation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Ready for Certificate Generation ({approvedAchievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedAchievements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedAchievements.map((achievement) => (
                  <TableRow key={achievement.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{achievement.users.name}</p>
                        <p className="text-xs text-gray-500">
                          {achievement.users.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="warning">
                        Level {achievement.levels.number}: {achievement.levels.title}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(achievement.decided_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => generateCertificate(achievement)}
                        disabled={generating === achievement.id}
                      >
                        <Award className="h-4 w-4 mr-2" />
                        {generating === achievement.id
                          ? 'Generating...'
                          : 'Generate Certificate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No certificates ready to generate
            </p>
          )}
        </CardContent>
      </Card>

      {/* Issued Certificates */}
      <Card>
        <CardHeader>
          <CardTitle>Issued Certificates ({certificates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {certificates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cert.users.name}</p>
                        <p className="text-xs text-gray-500">{cert.users.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">
                        Level {cert.levels.number}: {cert.levels.title}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(cert.issued_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <a
                        href={cert.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 py-8">No certificates issued yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
