import type { DispatchRecommendation as DispatchRec } from '@/lib/data/types';

export function DispatchRecommendation({ recommendation, onConfirm, confirming }: { recommendation: DispatchRec; onConfirm: () => void; confirming: boolean }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Recommended response</p>
      <p className="mt-2 text-sm text-ink-100">{recommendation.recommendationText}</p>
      <p className="mt-1 text-xs text-ink-400">{recommendation.suggestedRouteNote}</p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {recommendation.team && (
          <div className="rounded-md border border-ink-700 p-2 text-xs text-ink-300">
            Team: <span className="text-ink-100">{recommendation.team.name}</span> · {recommendation.team.distanceMeters}m
          </div>
        )}
        {recommendation.volunteer && (
          <div className="rounded-md border border-ink-700 p-2 text-xs text-ink-300">
            Volunteer: <span className="text-ink-100">{recommendation.volunteer.name}</span> · {recommendation.volunteer.distanceMeters}m
          </div>
        )}
        {recommendation.facility && (
          <div className="rounded-md border border-ink-700 p-2 text-xs text-ink-300">
            Facility: <span className="text-ink-100">{recommendation.facility.name}</span> · {recommendation.facility.distanceMeters}m
          </div>
        )}
      </div>
      <button
        onClick={onConfirm}
        disabled={confirming || (!recommendation.team && !recommendation.volunteer)}
        className="mt-3 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-light disabled:opacity-50"
      >
        {confirming ? 'Dispatching…' : 'Confirm dispatch'}
      </button>
      <p className="mt-1 text-[11px] text-ink-500">Requires human confirmation — KumbhOS never dispatches automatically.</p>
    </div>
  );
}
