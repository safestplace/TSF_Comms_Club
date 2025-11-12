import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabaseServer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Trophy, Medal } from 'lucide-react'

export default async function LeaderboardPage() {
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

  // Get leaderboard data
  const { data: leaderboard } = await supabase
    .from('v_leaderboard')
    .select('*, users(name, email)')
    .eq('club_id', membership.club_id)
    .order('approved_achievements_count', { ascending: false })
    .limit(50)

  const userRank =
    leaderboard?.findIndex((entry) => entry.user_id === user.id) ?? -1

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

      {userRank !== -1 && (
        <Card className="mb-6 border-primary-200 bg-primary-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Your Rank</p>
                <p className="text-3xl font-bold text-primary-600">
                  #{userRank + 1}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Achievements</p>
                <p className="text-2xl font-bold">
                  {leaderboard?.[userRank]?.approved_achievements_count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Top Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard?.map((entry, index) => (
              <div
                key={entry.user_id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  entry.user_id === user.id
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10">
                    {index === 0 && (
                      <Trophy className="h-8 w-8 text-warning-500" />
                    )}
                    {index === 1 && (
                      <Medal className="h-7 w-7 text-gray-400" />
                    )}
                    {index === 2 && (
                      <Medal className="h-6 w-6 text-warning-700" />
                    )}
                    {index > 2 && (
                      <span className="text-lg font-semibold text-gray-600">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{entry.users.name}</p>
                    <p className="text-sm text-gray-500">{entry.users.email}</p>
                  </div>
                </div>
                <Badge variant="info">
                  {entry.approved_achievements_count} achievements
                </Badge>
              </div>
            ))}

            {!leaderboard || leaderboard.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No leaderboard data yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}