import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabaseServer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'
import { Download, Award } from 'lucide-react'
import Link from 'next/link'

export default async function CertificatesPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's certificates
  const { data: certificates } = await supabase
    .from('certificates')
    .select(`
      *,
      levels(number, title),
      clubs(name),
      users!certificates_issued_by_fkey(name)
    `)
    .eq('user_id', user.id)
    .order('issued_at', { ascending: false })

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">My Certificates</h1>

      {certificates && certificates.length > 0 ? (
        <div className="grid gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex space-x-4">
                    <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                      <Award className="h-6 w-6 text-warning-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        Level {cert.levels.number}: {cert.levels.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {cert.clubs.name}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Issued {formatDateTime(cert.issued_at)}</span>
                        <span>•</span>
                        <span>By {cert.users.name}</span>
                      </div>
                      <Badge variant="success" className="mt-2">
                        Verified
                      </Badge>
                    </div>
                  </div>
                  <a
                    href={cert.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Certificates Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Complete achievements to earn certificates
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}