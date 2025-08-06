'use client'

import { ReactNode, HTMLAttributes } from 'react'
import clsx from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
  className?: string
}

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode
  className?: string
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div 
      className={clsx(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div 
      className={clsx('p-6 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }: CardTitleProps) {
  return (
    <h3 
      className={clsx('text-lg font-semibold text-gray-900', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ children, className, ...props }: CardDescriptionProps) {
  return (
    <p 
      className={clsx('text-sm text-gray-600 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div 
      className={clsx('p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
}
