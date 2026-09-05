import { RISK_META } from '@/lib/utils/format';
import { riskLevelLabels, tEnum } from '@/lib/i18n/enumLabels';
import { useLanguage } from '@/components/layout/LanguageProvider';
import type { CrowdPressure } from '@/lib/data/types';

export function PressureBadge({ pressure, showScore = true }: { pressure: CrowdPressure; showScore?: boolean }) {
  const { lang } = useLanguage();
  const meta = RISK_META[pressure.level];
  return (
    <span className={`badge border ${meta.bg} ${meta.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {tEnum(riskLevelLabels, pressure.level, lang)}
      {showScore && <span className="text-ink-300">· {pressure.score}</span>}
    </span>
  );
}
