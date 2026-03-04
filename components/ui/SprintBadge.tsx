import { SPRINT_STATUS_COLORS, SPRINT_STATUS_LABELS } from '@/types/sprint.types';

interface SprintBadgeProps {
  status: string;
  className?: string;
}

export default function SprintBadge({ status, className = '' }: SprintBadgeProps) {
  const color = SPRINT_STATUS_COLORS[status] || '#6B7280';
  const label = SPRINT_STATUS_LABELS[status] || status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  );
}
