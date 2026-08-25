import { BookMarked } from 'lucide-react';

/**
 * Distinct from DemoDataBadge on purpose: this marks a figure as real,
 * publicly reported data (with its own citation shown alongside), never to
 * be confused with the app's synthetic demo data. Mislabeling either
 * direction — calling real data "simulated" or vice versa — is exactly the
 * kind of provenance error this app is built to avoid everywhere else.
 */
export function SourcedDataBadge() {
  return (
    <span className="pill border border-brand-200 bg-brand-50 text-brand-700" title="Publicly reported figure, not simulated — see the cited source.">
      <BookMarked size={11} />
      PUBLICLY REPORTED
    </span>
  );
}
