'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { LANG_LABELS, type Lang } from '@/lib/i18n/dictionary';

// Shown once on app launch. Two jobs: greet in the languages people actually
// speak at the Nashik/Trimbakeshwar mela, and get the language choice made
// up front — before anyone has to read a settings label they may not be able
// to read. Each option shows its own script, so picking is recognition, not
// reading comprehension.
const GREETINGS = [
  { text: 'स्वागत आहे', lang: 'Marathi' },
  { text: 'स्वागत है', lang: 'Hindi' },
  { text: 'Welcome', lang: 'English' },
  { text: 'સ્વાગત છે', lang: 'Gujarati' },
  { text: 'ਜੀ ਆਇਆਂ ਨੂੰ', lang: 'Punjabi' },
  { text: 'স্বাগতম', lang: 'Bengali' },
  { text: 'స్వాగతం', lang: 'Telugu' },
  { text: 'வரவேற்கிறோம்', lang: 'Tamil' },
  { text: 'ಸ್ವಾಗತ', lang: 'Kannada' },
  { text: 'സ്വാഗതം', lang: 'Malayalam' },
  { text: 'ସ୍ୱାଗତ', lang: 'Odia' },
  { text: 'خوش آمدید', lang: 'Urdu' }
];

const LANG_STORAGE_KEY = 'kumbhos-welcome-seen';
const CONSENT_STORAGE_KEY = 'kumbhos-privacy-consented';

const CONSENT_COPY: Record<Lang, { title: string; intro: string; bullets: string[]; agree: string; note: string }> = {
  en: {
    title: 'Before you continue',
    intro: 'KumbhOS is built to collect as little personal data as possible, only when you choose to use a specific feature.',
    bullets: [
      'ID Wristband and Lost & Found are the only features that store anything identifying — a name, phone number, and what you type in — and only because you filled that form in.',
      'Your location is read by your own device and never sent to any server — it stays on your phone unless you choose to share it (e.g. the SOS location link).',
      'No facial recognition, no ad trackers, no selling or sharing of your data with third parties, ever.',
      'You can read the full policy any time from the menu → Privacy Policy, including your rights under India’s DPDP Act, 2023.'
    ],
    agree: 'I Agree & Continue',
    note: 'You must accept this to use the app.'
  },
  hi: {
    title: 'जारी रखने से पहले',
    intro: 'KumbhOS को यथासंभव कम व्यक्तिगत डेटा एकत्र करने के लिए बनाया गया है, और तभी जब आप किसी विशेष सुविधा का उपयोग करना चुनते हैं।',
    bullets: [
      'ID पहचान पट्टी और खोया-पाया ही एकमात्र सुविधाएं हैं जो पहचान संबंधी जानकारी संग्रहीत करती हैं — नाम, फ़ोन नंबर, और जो आप टाइप करते हैं — और केवल इसलिए क्योंकि आपने वह फ़ॉर्म भरा है।',
      'आपका स्थान आपके अपने डिवाइस द्वारा पढ़ा जाता है और कभी भी किसी सर्वर पर नहीं भेजा जाता — यह आपके फ़ोन पर ही रहता है जब तक आप इसे साझा करना नहीं चुनते।',
      'कोई चेहरा पहचान नहीं, कोई विज्ञापन ट्रैकर नहीं, आपके डेटा को तीसरे पक्ष के साथ कभी नहीं बेचा या साझा किया जाता।',
      'आप कभी भी मेनू → गोपनीयता नीति से पूरी नीति पढ़ सकते हैं, जिसमें भारत के DPDP अधिनियम, 2023 के तहत आपके अधिकार शामिल हैं।'
    ],
    agree: 'मैं सहमत हूं और जारी रखूं',
    note: 'ऐप का उपयोग करने के लिए आपको इसे स्वीकार करना होगा।'
  },
  mr: {
    title: 'पुढे जाण्यापूर्वी',
    intro: 'KumbhOS शक्य तितका कमी वैयक्तिक डेटा गोळा करण्यासाठी तयार केले आहे, आणि तेव्हाच जेव्हा तुम्ही एखादे विशिष्ट वैशिष्ट्य वापरण्याचे निवडता.',
    bullets: [
      'ID ओळख पट्टी आणि हरवले-सापडले हीच वैशिष्ट्ये आहेत जी ओळखीची माहिती साठवतात — नाव, फोन नंबर, आणि तुम्ही जे टाइप करता — आणि फक्त कारण तुम्ही तो फॉर्म भरला आहे.',
      'तुमचे स्थान तुमच्या स्वतःच्या डिव्हाइसद्वारे वाचले जाते आणि कधीही कोणत्याही सर्व्हरवर पाठवले जात नाही — तुम्ही ते शेअर करण्याचे निवडत नाही तोपर्यंत ते तुमच्या फोनवरच राहते.',
      'चेहरा ओळख नाही, जाहिरात ट्रॅकर नाही, तुमचा डेटा कधीही तिसऱ्या पक्षाला विकला किंवा शेअर केला जात नाही.',
      'तुम्ही मेनू → गोपनीयता धोरण मधून पूर्ण धोरण कधीही वाचू शकता, ज्यात भारताच्या DPDP कायदा, 2023 अंतर्गत तुमचे अधिकार समाविष्ट आहेत.'
    ],
    agree: 'मी सहमत आहे आणि पुढे चालू ठेवा',
    note: 'अ‍ॅप वापरण्यासाठी तुम्हाला हे स्वीकारावे लागेल.'
  }
};

function alreadyPastLanguageStep(): boolean {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function WelcomeScreen({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState<'language' | 'consent'>(() => (alreadyPastLanguageStep() ? 'consent' : 'language'));
  const { lang, setLang } = useLanguage();

  // Cycle the greeting so every script gets a turn while the user decides.
  useEffect(() => {
    if (step !== 'language') return;
    const id = setInterval(() => setIndex((i) => (i + 1) % GREETINGS.length), 1400);
    return () => clearInterval(id);
  }, [step]);

  function choose(code: Lang) {
    setLang(code);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, 'true');
    } catch {
      // Storage blocked — worst case the welcome shows again next launch.
    }
    setStep('consent');
  }

  function agree() {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, 'true');
    } catch {
      // Storage blocked — worst case this screen shows again next launch.
    }
    onDone();
  }

  if (step === 'consent') {
    const copy = CONSENT_COPY[lang];
    return (
      <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-paper-bg px-6 py-10">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center justify-center gap-2 text-3xl" aria-hidden="true">
            🕉️ 🪔 🛕
          </div>
          <h1 className="heading-serif mt-4 text-center text-2xl text-paper-text">{copy.title}</h1>
          <p className="mt-2 text-center text-sm text-paper-muted">{copy.intro}</p>

          <ul className="mt-6 space-y-3">
            {copy.bullets.map((b, i) => (
              <li key={i} className="paper-card flex gap-2.5 p-3 text-sm text-paper-text">
                <span className="shrink-0 text-risk-normal" aria-hidden="true">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={agree}
            className="fast-transition mt-6 flex w-full items-center justify-center rounded-xl bg-brand-500 py-4 text-lg font-bold text-white hover:bg-brand-600"
          >
            {copy.agree}
          </button>
          <p className="mt-3 text-center text-xs text-paper-faint">{copy.note}</p>
        </div>
      </div>
    );
  }

  const greeting = GREETINGS[index]!;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper-bg px-6">
      <div className="flex h-28 items-center justify-center">
        <p key={index} className="heading-serif animate-fade-in text-center text-4xl text-paper-text">
          {greeting.text}
        </p>
      </div>
      <p className="mt-1 text-xs uppercase tracking-widest text-paper-faint">{greeting.lang}</p>

      <div className="mt-10 flex items-center gap-2 text-3xl" aria-hidden="true">
        🕉️ 🪔 🛕
      </div>
      <h1 className="heading-serif mt-4 text-center text-2xl text-paper-text">KumbhOS</h1>
      <p className="mt-1 text-center text-sm text-paper-muted">Kumbh Mela safety &amp; navigation</p>

      <div className="mt-10 w-full max-w-xs space-y-2.5">
        {(Object.keys(LANG_LABELS) as Lang[]).map((code) => (
          <button
            key={code}
            onClick={() => choose(code)}
            className="fast-transition flex w-full items-center justify-center gap-2 rounded-xl border border-paper-border bg-paper-surface py-4 text-lg font-semibold text-paper-text hover:bg-brand-50"
          >
            <span aria-hidden="true">🗣️</span>
            {LANG_LABELS[code]}
          </button>
        ))}
      </div>

      <p className="mt-8 text-center text-[11px] leading-snug text-paper-faint">Choose your language · भाषा निवडा · भाषा चुनें</p>
    </div>
  );
}

/** True until the user has picked a language AND accepted the privacy policy. */
export function useWelcomeGate(): { show: boolean; dismiss: () => void } {
  // Starts false so server render and first client render agree; the effect
  // flips it on if this device hasn't completed onboarding yet.
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(CONSENT_STORAGE_KEY) !== 'true') setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  return { show, dismiss: () => setShow(false) };
}
