import type { CrowdPrediction } from '@/lib/data/types';

export function PredictionCard({ prediction }: { prediction: CrowdPrediction }) {
  return (
    <div className="paper-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-paper-muted">Prototype Prediction</span>
        <span className="text-xs text-paper-muted">{Math.round(prediction.probabilityOfCritical * 100)}% likelihood of critical pressure</span>
      </div>
      {prediction.minutesToCriticalThreshold !== null ? (
        <p className="text-sm text-paper-text">
          Projected to reach the next risk threshold in{' '}
          <span className="font-semibold text-amber-600">{prediction.minutesToCriticalThreshold} minutes</span>.
        </p>
      ) : (
        <p className="text-sm text-paper-text">No threshold crossing projected in the next 15 minutes.</p>
      )}
      <p className="mt-2 text-sm text-paper-muted">{prediction.recommendation}</p>
    </div>
  );
}
