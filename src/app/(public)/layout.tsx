import { LanguageProvider } from '@/components/layout/LanguageProvider';
import { LocationProvider } from '@/components/layout/LocationProvider';
import { AppShell } from '@/components/layout/AppShell';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <LocationProvider>
        <AppShell>{children}</AppShell>
      </LocationProvider>
    </LanguageProvider>
  );
}
