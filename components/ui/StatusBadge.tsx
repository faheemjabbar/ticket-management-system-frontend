interface StatusBadgeProps {
  status: 'pending' | 'assigned' | 'awaiting' | 'closed';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    pending: 'bg-blue-100 text-blue-700 border-blue-200',
    assigned: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    awaiting: 'bg-purple-100 text-purple-700 border-purple-200',
    closed: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const labels = {
    pending: 'Pending',
    assigned: 'Assigned',
    awaiting: 'Awaiting Response',
    closed: 'Closed',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
