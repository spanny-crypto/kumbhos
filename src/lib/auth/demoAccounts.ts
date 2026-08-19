import type { Role } from '@/lib/data/types';

// Split out from rbac.ts so client components (the login page) can read the
// demo credential list without pulling in rbac.ts's next/headers-dependent
// session import into the client bundle.
export const DEMO_ACCOUNTS: { username: string; password: string; role: Role; name: string }[] = [
  { username: 'admin', password: 'kumbhos-admin', role: 'SUPER_ADMIN', name: 'Super Admin' },
  { username: 'command', password: 'kumbhos-command', role: 'COMMAND_CENTER', name: 'Command Centre Operator' },
  { username: 'police', password: 'kumbhos-police', role: 'POLICE', name: 'Police Desk' },
  { username: 'medical', password: 'kumbhos-medical', role: 'MEDICAL', name: 'Medical Desk' },
  { username: 'fire', password: 'kumbhos-fire', role: 'FIRE', name: 'Fire Desk' },
  { username: 'sanitation', password: 'kumbhos-sanitation', role: 'SANITATION', name: 'Sanitation Desk' },
  { username: 'volunteer', password: 'kumbhos-volunteer', role: 'VOLUNTEER', name: 'Volunteer Desk' },
  { username: 'viewer', password: 'kumbhos-viewer', role: 'VIEW_ONLY', name: 'Observer' }
];
