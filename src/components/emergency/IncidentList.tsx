import { relativeTime, titleCase } from '@/lib/utils/format';
import type { Incident } from '@/lib/data/types';

const SEVERITY_STYLE: Record<Incident['severity'], string> = {
  LOW: 'text-ink-300 border-ink-600',
  MODERATE: 'text-risk-building border-risk-building/40',
  HIGH: 'text-risk-critical border-risk-critical/40',
  CRITICAL: 'text-risk-intervention border-risk-intervention/40'
};

export function IncidentList({ incidents, selectedId, onSelect }: { incidents: Incident[]; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="scrollbar-thin h-full space-y-2 overflow-y-auto pr-1">
      {incidents.map((incident) => (
        <button
          key={incident.id}
          onClick={() => onSelect(incident.id)}
          className={`block w-full rounded-lg border p-3 text-left transition ${
            selectedId === incident.id ? 'border-accent bg-accent/10' : 'border-ink-700 bg-ink-800/40 hover:bg-ink-800'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-ink-50">{titleCase(incident.type)}</span>
            <span className={`badge border ${SEVERITY_STYLE[incident.severity]}`}>{titleCase(incident.severity)}</span>
          </div>
          <p className="mt-1 truncate text-xs text-ink-400">{incident.description}</p>
          <div className="mt-1 flex items-center justify-between text-xs text-ink-500">
            <span>{titleCase(incident.status)}</span>
            <span>{relativeTime(incident.reportedAt)}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
