import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-lime-400',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#2a2a2a] text-white',
        secondary: 'border-transparent bg-[#1a1a1a] text-[#888]',
        destructive: 'border-transparent bg-red-600 text-white',
        outline: 'border-[#2a2a2a] text-white',
        success: 'border-transparent bg-green-600 text-white',
        warning: 'border-transparent bg-yellow-600 text-black',
        secondary_alt: 'border-transparent bg-[#2a2a2a] text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }