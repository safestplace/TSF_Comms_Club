import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'glass' | 'elevated' | 'minimal'
  interactive?: boolean
  glowEffect?: boolean
}

export function Card({ 
  className, 
  children, 
  variant = 'default', 
  interactive = false,
  glowEffect = false,
  ...props 
}: CardProps) {
  return (
    <div
      className={cn(
        // Base styles
        'rounded-2xl transition-all duration-300',
        
        // Variant styles
        {
          // Modern glass morphism
          'bg-white/5 backdrop-blur-sm border border-white/10 p-8': variant === 'glass' || variant === 'default',
          
          // Elevated with shadow
          'bg-white/10 backdrop-blur-md border border-white/20 p-8 shadow-2xl': variant === 'elevated',
          
          // Minimal clean
          'bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6': variant === 'minimal',
        },
        
        // Interactive effects
        interactive && [
          'hover:bg-white/10 hover:border-white/20 hover:scale-105 cursor-pointer',
          'hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300'
        ],
        
        // Glow effect
        glowEffect && [
          'relative overflow-hidden',
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/20 before:to-purple-500/20 before:opacity-0 before:transition-opacity before:duration-300',
          'hover:before:opacity-100'
        ],
        
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ 
  className, 
  children, 
  ...props 
}: CardProps) {
  return (
    <div className={cn('mb-6', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ 
  className, 
  children, 
  ...props 
}: CardProps) {
  return (
    <h3 className={cn(
      'text-2xl font-bold text-white leading-tight',
      'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent',
      className
    )} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ 
  className, 
  children, 
  ...props 
}: CardProps) {
  return (
    <p className={cn(
      'text-slate-300 text-lg leading-relaxed',
      className
    )} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ 
  className, 
  children, 
  ...props 
}: CardProps) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ 
  className, 
  children, 
  ...props 
}: CardProps) {
  return (
    <div className={cn('mt-8 pt-6 border-t border-white/10', className)} {...props}>
      {children}
    </div>
  )
}

// Specialized card components
export function FeatureCard({ 
  icon, 
  title, 
  description, 
  className,
  ...props 
}: {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
} & CardProps) {
  return (
    <Card 
      variant="glass" 
      interactive 
      glowEffect
      className={className}
      {...props}
    >
      <CardHeader>
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <CardTitle className="text-xl mb-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

export function StatCard({ 
  value, 
  label, 
  trend, 
  className,
  ...props 
}: {
  value: string | number
  label: string
  trend?: {
    value: string
    isPositive: boolean
  }
  className?: string
} & CardProps) {
  return (
    <Card 
      variant="elevated" 
      className={cn('text-center', className)}
      {...props}
    >
      <CardContent>
        <div className="text-4xl font-bold text-white mb-2">{value}</div>
        <div className="text-slate-300 text-lg">{label}</div>
        {trend && (
          <div className={cn(
            'mt-3 text-sm font-medium',
            trend.isPositive ? 'text-green-400' : 'text-red-400'
          )}>
            {trend.isPositive ? '↗' : '↘'} {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
