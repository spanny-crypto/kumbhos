export function DemoDataBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className="pill border border-amber-300 bg-amber-50 text-amber-700" title="This figure is synthetic prototype data, not a live government feed.">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      {compact ? 'DEMO' : 'SIMULATION / DEMO DATA'}
    </span>
  );
}
