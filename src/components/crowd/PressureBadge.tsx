import { RISK_META } from '@/lib/utils/format';
import type { CrowdPressure } from '@/lib/data/types';

export function PressureBadge({ pressure, showScore = true }: { pressure: CrowdPressure; showScore?: boolean }) {
  const meta = RISK_META[pressure.level];
  return (
    <span className={`badge border ${meta.bg} ${meta.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
      {showScore && <span className="text-ink-300">· {pressure.score}</span>}
    </span>
  );
}
