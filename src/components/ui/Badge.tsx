import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  color?: string;
  bg?: string;
  className?: string;
}

export function Badge({ children, color = '#6b7280', bg = '#f3f4f6', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
        className
      )}
      style={{ color, backgroundColor: bg }}
    >
      {children}
    </span>
  );
}
