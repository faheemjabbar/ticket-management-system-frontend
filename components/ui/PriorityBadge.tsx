import { AlertCircle, ArrowUp, Minus, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const styles = {
    low: 'bg-gray-100 text-gray-700 border-gray-200',
    medium: 'bg-blue-100 text-blue-700 border-blue-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    critical: 'bg-red-100 text-red-700 border-red-200',
  };

  const icons = {
    low: ArrowDown,
    medium: Minus,
    high: ArrowUp,
    critical: AlertCircle,
  };

  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };

  const Icon = icons[priority];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium border ${styles[priority]}`}>
      <Icon className="w-3 h-3" />
      {labels[priority]}
    </span>
  );
}
