'use client';

import { ChatPanel } from '@/components/assistant/ChatPanel';
import { useLanguage } from '@/components/layout/LanguageProvider';

export default function AssistantPage() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col px-4 py-6">
      <div className="mb-3">
        <h1 className="heading-serif text-3xl text-paper-text">{t('pageAssistantTitle')}</h1>
        <p className="text-sm text-paper-muted">{t('pageAssistantSubtitle')}</p>
      </div>
      <div className="paper-card min-h-0 flex-1">
        <ChatPanel />
      </div>
    </div>
  );
}
