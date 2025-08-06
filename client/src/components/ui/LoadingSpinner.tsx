'use client'

import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={clsx('flex flex-col items-center justify-center space-y-2', className)}>
      <Loader2 className={clsx('animate-spin text-blue-600', sizeClasses[size])} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  )
}

interface SkeletonLoaderProps {
  rows?: number
  className?: string
}

export function SkeletonLoader({ rows = 6, className }: SkeletonLoaderProps) {
  return (
    <div className={clsx('bg-white rounded-xl border border-gray-200 shadow-lg p-6', className)}>
      <div className="animate-pulse space-y-4">
        {[...Array(rows)].map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ErrorStateProps {
  title: string
  message: string
  icon?: React.ReactNode
  onRetry?: () => void
  className?: string
}

export function ErrorState({ title, message, icon, onRetry, className }: ErrorStateProps) {
  return (
    <div className={clsx('bg-white rounded-xl border border-red-500 shadow-lg p-6 text-center', className)}>
      {icon && <div className="mx-auto mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-black mb-2">{title}</h3>
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  message: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ title, message, icon, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('bg-white rounded-xl border border-gray-200 shadow-lg p-6 text-center', className)}>
      {icon && <div className="mx-auto mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-black mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
