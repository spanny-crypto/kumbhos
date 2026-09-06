'use client';

import { WelcomeScreen, useWelcomeGate } from './WelcomeScreen';

/** Renders the first-launch welcome/language picker over the app, once. */
export function WelcomeGate() {
  const { show, dismiss } = useWelcomeGate();
  if (!show) return null;
  return <WelcomeScreen onDone={dismiss} />;
}
