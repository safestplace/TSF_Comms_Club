'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'
import { Bell, Check } from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setNotifications(data || [])
    setLoading(false)
  }

  const markAsRead = async (notificationId: number) => {
    await (supabase
      .from('notifications') as any)
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)

    fetchNotifications()
  }

  const markAllAsRead = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await (supabase
      .from('notifications') as any)
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null)

    fetchNotifications()
  }

  const unreadCount = notifications.filter((n) => !n.read_at).length

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Button size="sm" variant="ghost" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {unreadCount > 0 && (
        <Card className="mb-6 border-primary-200 bg-primary-50">
          <CardContent className="pt-6">
            <p className="text-sm text-primary-900">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={!notification.read_at ? 'border-primary-200 bg-primary-50/30' : ''}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex space-x-3 flex-1">
                  <div className={`mt-1 ${!notification.read_at ? 'text-primary-600' : 'text-gray-400'}`}>
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className={!notification.read_at ? 'font-medium' : ''}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateTime(notification.created_at)}
                    </p>
                  </div>
                </div>
                {!notification.read_at && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {notifications.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No notifications yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
