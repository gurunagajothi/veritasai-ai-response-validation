import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Badge({ children, variant = 'neutral', className = '', size = 'md' }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800/60',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800/60',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function VerdictBadge({ verdict, size = 'md' }: { verdict: string; size?: 'sm' | 'md' | 'lg' }) {
  if (verdict === 'PASS') {
    return <Badge variant="success" size={size}><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>PASS</Badge>;
  }
  if (verdict === 'NEEDS IMPROVEMENT') {
    return <Badge variant="warning" size={size}><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>NEEDS IMPROVEMENT</Badge>;
  }
  return <Badge variant="danger" size={size}><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>FAIL</Badge>;
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, BadgeVariant> = {
    Low: 'info',
    Medium: 'warning',
    High: 'danger',
    Critical: 'danger',
  };
  return <Badge variant={map[severity] || 'neutral'} size="sm">{severity}</Badge>;
}
