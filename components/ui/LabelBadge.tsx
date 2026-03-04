interface LabelBadgeProps {
  name: string;
  color: string;
  className?: string;
  onRemove?: () => void;
}

export default function LabelBadge({ name, color, className = '', onRemove }: LabelBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-70"
        >
          ×
        </button>
      )}
    </span>
  );
}
