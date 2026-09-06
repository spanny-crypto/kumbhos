// Shared shape for the Live Billboard feed.
//
// This lived in the /api/billboard route handler, which meant the billboard
// page imported a type across the client/server boundary. That breaks the
// static app build (which parks the API routes entirely), so the contract
// lives here and both sides import it from one place.
export type BillboardSeverity = 'INFO' | 'WATCH' | 'WARNING' | 'CRITICAL';

export interface BillboardEntry {
  id: string;
  severity: BillboardSeverity;
  category: 'CROWD' | 'INCIDENT' | 'SIMULATION';
  zoneName: string;
  headline: string;
  detail: string;
  timestamp: string;
}
