import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded font-semibold transition-opacity hover:opacity-90 disabled:opacity-40',
        variant === 'primary' && 'bg-mumble-accent text-black',
        variant === 'secondary' && 'bg-mumble-bg3 border border-mumble-border text-mumble-text',
        variant === 'danger' && 'bg-red-500 text-white',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
