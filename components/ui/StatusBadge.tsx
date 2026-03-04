import { Circle, Clock, User, MessageSquare, CheckCircle, Archive, XCircle, AlertCircle } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS } from '@/types/ticket.types';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const iconMap: Record<string, any> = {
    backlog: Circle,
    todo: Clock,
    in_progress: User,
    in_review: MessageSquare,
    qa_testing: AlertCircle,
    done: CheckCircle,
    closed: Archive,
    blocked: XCircle,
    rejected: XCircle,
  };

  const label = STATUS_LABELS[status] || status;
  const color = STATUS_COLORS[status] || '#6B7280';
  const Icon = iconMap[status] || Circle;

  // Convert hex to RGB for background
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 107, g: 114, b: 128 };
  };

  const rgb = hexToRgb(color);
  const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
  const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;

  return (
    <span 
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium border"
      style={{ 
        backgroundColor: bgColor,
        color: color,
        borderColor: borderColor
      }}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
