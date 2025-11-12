'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto',
        'transition-all duration-300 transform',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        {
          'bg-success-50 border border-success-200': type === 'success',
          'bg-error-50 border border-error-200': type === 'error',
          'bg-primary-50 border border-primary-200': type === 'info',
        }
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            <p
              className={cn('text-sm font-medium', {
                'text-success-800': type === 'success',
                'text-error-800': type === 'error',
                'text-primary-800': type === 'info',
              })}
            >
              {message}
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="ml-4 inline-flex text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}