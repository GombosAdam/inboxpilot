interface StatBadgeProps {
  stat: string;
}

export function StatBadge({ stat }: StatBadgeProps) {
  return (
    <div className="text-center">
      <div className="text-lg font-semibold text-ink">{stat}</div>
    </div>
  );
}