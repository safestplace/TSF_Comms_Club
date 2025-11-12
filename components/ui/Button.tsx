import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-semibold',
          'transition-all duration-300 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
          'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
          'relative overflow-hidden group',
          
          // Hover effects
          'hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5',
          'active:scale-95 active:translate-y-0',
          
          // Sizes
          {
            'px-3 py-1.5 text-sm rounded-lg': size === 'sm',
            'px-4 py-2.5 text-sm rounded-lg': size === 'md',
            'px-6 py-3 text-base rounded-xl': size === 'lg',
            'px-8 py-4 text-lg rounded-xl': size === 'xl',
          },
          
          // Variants
          {
            // Modern gradient button
            'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500':
              variant === 'primary' || variant === 'gradient',
            
            // Glass morphism secondary
            'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 focus:ring-white/50':
              variant === 'secondary',
            
            // Danger button
            'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-red-500/25 focus:ring-red-500':
              variant === 'danger',
            
            // Ghost button
            'bg-transparent hover:bg-white/10 text-slate-300 hover:text-white border border-transparent hover:border-white/20 focus:ring-white/50':
              variant === 'ghost',
          },
          
          // Loading state
          {
            'cursor-wait': isLoading,
          },
          
          className
        )}
        {...props}
      >
        {/* Shimmer effect overlay */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
        
        {/* Content */}
        <span className="relative z-10 flex items-center">
          {isLoading && (
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {children}
        </span>
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
