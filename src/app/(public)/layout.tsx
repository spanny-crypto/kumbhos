import { LanguageProvider } from '@/components/layout/LanguageProvider';
import { LocationProvider } from '@/components/layout/LocationProvider';
import { AppShell } from '@/components/layout/AppShell';
import { WelcomeGate } from '@/components/layout/WelcomeGate';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <LocationProvider>
        <WelcomeGate />
        <AppShell>{children}</AppShell>
      </LocationProvider>
    </LanguageProvider>
  );
}
