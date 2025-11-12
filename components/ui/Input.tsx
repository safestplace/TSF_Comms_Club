import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef, useState } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'glass' | 'minimal' | 'compact'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    variant = 'default',
    leftIcon,
    rightIcon,
    type = 'text', 
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const hasValue = props.value && String(props.value).length > 0
    const hasError = Boolean(error)

    // Get variant-specific styles
    const getVariantStyles = () => {
      switch (variant) {
        case 'glass':
          return 'px-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-white hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10 focus:bg-white/10 focus:border-blue-400/60 focus:ring-blue-400/50 focus:shadow-lg focus:shadow-blue-500/20 has-[leftIcon]:pl-14 has-[rightIcon]:pr-14'
        case 'compact':
          return 'px-3 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white hover:bg-white/10 hover:border-white/20 focus:bg-white/10 focus:border-blue-500/50 focus:ring-blue-500/50 has-[leftIcon]:pl-10 has-[rightIcon]:pr-10'
        case 'minimal':
          return 'px-4 py-3 bg-transparent border border-slate-600 rounded-lg text-white hover:border-slate-500 focus:border-blue-500 focus:ring-blue-500/50 has-[leftIcon]:pl-12 has-[rightIcon]:pr-12'
        default:
          return 'px-4 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-white/20 focus:bg-white/10 focus:border-blue-500/50 focus:ring-blue-500/50 has-[leftIcon]:pl-12 has-[rightIcon]:pr-12'
      }
    }

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-2 transition-colors duration-200">
            {label}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200">
              {leftIcon}
            </div>
          )}
          
          {/* Input Field */}
          <input
            type={type}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              // Base styles
              'w-full transition-all duration-300 ease-out',
              'placeholder-slate-400 text-white text-sm',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              
              // Variant styles
              getVariantStyles(),
              
              // Error state
              hasError && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50 hover:border-red-500/70',
              
              // Focus animation
              isFocused && 'scale-[1.01]',
              
              className
            )}
            {...props}
          />
          
          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200">
              {rightIcon}
            </div>
          )}
          
          {/* Error Icon */}
          {hasError && !rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          {/* Focus ring effect */}
          {isFocused && (
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-sm -z-10 animate-pulse" />
          )}
        </div>
        
        {/* Helper Text or Error */}
        {(error || helperText) && (
          <div className="mt-1 flex items-center space-x-2">
            {error ? (
              <p className="text-xs text-red-400 flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </p>
            ) : (
              <p className="text-xs text-slate-400">{helperText}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
