// Real Nashik–Trimbakeshwar Simhastha Kumbh Mela 2026–2028 schedule —
// editorial content compiled from public sources, not live/synthetic data.
// Dates are as publicly announced/estimated well ahead of the event and may
// shift slightly once the final Panchang-based calendar is confirmed closer
// to the date; that caveat is shown in the UI rather than presented as
// certain. Sources are attributed per-entry via `sourceUrl`.
export type CalendarCategory = 'milestone' | 'shahi-snan' | 'parva-snan' | 'daily';

export interface CalendarEvent {
  id: string;
  date: string; // ISO yyyy-mm-dd (start date for multi-day entries)
  endDate?: string; // ISO yyyy-mm-dd, only for multi-day entries
  title: string;
  category: CalendarCategory;
  location?: string;
  description: string;
  sourceUrl?: string;
}

export const CALENDAR_CATEGORY_LABELS: Record<CalendarCategory, string> = {
  milestone: 'Milestone Ceremony',
  'shahi-snan': 'Shahi (Amrit) Snan',
  'parva-snan': 'Parva Snan',
  daily: 'Daily Ongoing'
};

export const CALENDAR_CATEGORY_COLOR: Record<CalendarCategory, string> = {
  milestone: '#7c5cff',
  'shahi-snan': '#dc2626',
  'parva-snan': '#ea580c',
  daily: '#0891b2'
};

/** Recurring, not tied to one date — shown regardless of which date is selected within the Mela season. */
export const DAILY_EVENTS: CalendarEvent[] = [
  {
    id: 'maha-aarti',
    date: '',
    title: 'Maha Aarti',
    category: 'daily',
    location: 'Ramkund (Nashik) & Kushavarta Kund (Trimbakeshwar)',
    description: 'Nightly synchronized lamp-lighting ceremonies at the two main ghats.'
  },
  {
    id: 'pravachan',
    date: '',
    title: 'Pravachan & Shastrartha',
    category: 'daily',
    location: 'Akhara camps, Tapovan and Panchavati',
    description: 'Daily morning and evening scriptural discourses, yoga workshops, and philosophical debates.'
  },
  {
    id: 'sanskriti-karyakram',
    date: '',
    title: 'Sanskriti Karyakram',
    category: 'daily',
    location: 'Stages near key sectors',
    description: 'State-sponsored cultural folk music, traditional dance, and bhajan singing.'
  },
  {
    id: 'annadan',
    date: '',
    title: 'Annadan (Mass Community Kitchens)',
    category: 'daily',
    location: 'Major pilgrim shelters',
    description: 'Non-stop charitable food distribution tracks.'
  }
];

export const KUMBH_CALENDAR: CalendarEvent[] = [
  {
    id: 'dhwajarohan',
    date: '2026-10-31',
    title: 'Dhwajarohan (Official Flag Hoisting)',
    category: 'milestone',
    location: 'Ramkund (Nashik), Panchavati, Trimbakeshwar',
    description: 'Marks the formal astrological commencement of the Simhastha Kumbh Mela cycle.',
    sourceUrl: 'https://www.tourmyindia.com/kumbhmela/nasik-kumbh.html'
  },
  {
    id: 'karka-sankranti',
    date: '2027-07-17',
    title: 'Karka Sankranti Snan',
    category: 'parva-snan',
    description: 'Secondary auspicious bathing day; high-volume attendance expected.',
    sourceUrl: 'https://nashikkumbhmela.co.in/dates-and-schedule/'
  },
  {
    id: 'guru-purnima',
    date: '2027-07-18',
    title: 'Guru Purnima Snan',
    category: 'parva-snan',
    description: 'Secondary auspicious bathing day honoring teachers and gurus.',
    sourceUrl: 'https://nashikkumbhmela.co.in/dates-and-schedule/'
  },
  {
    id: 'flag-hoisting-main',
    date: '2027-07-24',
    title: 'Flag Hoisting Ceremony (Main Mela Opening)',
    category: 'milestone',
    description: 'The opening of the principal peak phase — Akhara camps fully settle.',
    sourceUrl: 'https://nashikkumbhmela.org/nashik-kumbh-mela-2027-guide/'
  },
  {
    id: 'nagar-pradakshina',
    date: '2027-07-29',
    title: 'Nagar Pradakshina',
    category: 'milestone',
    location: 'Nashik city (14 km route)',
    description: 'A massive 14 km city-wide holy circumambulation of Nashik city by sadhus and thousands of devotees.',
    sourceUrl: 'https://nashikkumbhmela.co.in/dates-and-schedule/'
  },
  {
    id: 'shahi-yatra-1',
    date: '2027-08-02',
    title: 'Akhara Shahi Yatra (Pre-Snan Procession)',
    category: 'milestone',
    description: 'Grand, vibrant early-morning procession of Naga Sadhus and holy orders marching toward the ghats, ahead of today’s Amrit Snan.',
    sourceUrl: 'https://www.tourmyindia.com/kumbhmela/nasik-kumbh.html'
  },
  {
    id: 'shahi-snan-1',
    date: '2027-08-02',
    title: 'First Amrit Snan — Ashadha Somvati Amavasya',
    category: 'shahi-snan',
    location: 'Ramkund (Nashik) & Kushavarta Kund (Trimbakeshwar)',
    description: 'The Akharas take the royal dip first, followed by general public access. Highly spiritually potent — expect the heaviest crowds and security presence of the year.',
    sourceUrl: 'https://www.tourmyindia.com/kumbhmela/nasik-kumbh.html'
  },
  {
    id: 'shahi-yatra-2',
    date: '2027-08-31',
    title: 'Akhara Shahi Yatra (Pre-Snan Procession)',
    category: 'milestone',
    description: 'Grand, vibrant early-morning procession of Naga Sadhus and holy orders marching toward the ghats, ahead of today’s Amrit Snan.',
    sourceUrl: 'https://www.tourmyindia.com/kumbhmela/nasik-kumbh.html'
  },
  {
    id: 'shahi-snan-2',
    date: '2027-08-31',
    title: 'Second Amrit Snan — Shravan Amavasya',
    category: 'shahi-snan',
    description: 'Regarded as the absolute peak bathing day with maximum crowd density of the entire Mela.',
    sourceUrl: 'https://nashikkumbhmela.org/nashik-kumbh-mela-2027-guide/'
  },
  {
    id: 'shahi-yatra-3',
    date: '2027-09-11',
    title: 'Akhara Shahi Yatra (Pre-Snan Procession)',
    category: 'milestone',
    description: 'Grand, vibrant early-morning procession of Naga Sadhus and holy orders marching toward the ghats, ahead of today’s Amrit Snan.',
    sourceUrl: 'https://www.tourmyindia.com/kumbhmela/nasik-kumbh.html'
  },
  {
    id: 'shahi-snan-3-vaishnava',
    date: '2027-09-11',
    title: 'Third Amrit Snan — Vaishnava Sadhus',
    category: 'shahi-snan',
    location: 'Ramkund, Nashik',
    description: 'Dedicated royal bath for the Vaishnava sect.',
    sourceUrl: 'https://nashikkumbhmela.org/nashik-kumbh-mela-2027-guide/'
  },
  {
    id: 'shahi-yatra-4',
    date: '2027-09-12',
    title: 'Akhara Shahi Yatra (Pre-Snan Procession)',
    category: 'milestone',
    description: 'Grand, vibrant early-morning procession of Naga Sadhus and holy orders marching toward the ghats, ahead of today’s Amrit Snan.',
    sourceUrl: 'https://www.tourmyindia.com/kumbhmela/nasik-kumbh.html'
  },
  {
    id: 'shahi-snan-3-shaiva',
    date: '2027-09-12',
    title: 'Third Amrit Snan — Shaiva Sadhus',
    category: 'shahi-snan',
    location: 'Kushavarta, Trimbakeshwar',
    description: 'Dedicated royal bath for the Shaiva sect.',
    sourceUrl: 'https://nashikkumbhmela.org/nashik-kumbh-mela-2027-guide/'
  },
  {
    id: 'bhadrapada-purnima',
    date: '2027-09-15',
    title: 'Bhadrapada Purnima Snan',
    category: 'parva-snan',
    description: 'Secondary auspicious bathing day.',
    sourceUrl: 'https://nashikkumbhmela.co.in/dates-and-schedule/'
  },
  {
    id: 'ashwin-ekadashi',
    date: '2027-10-11',
    title: 'Ashwin Shudh Ekadashi Snan',
    category: 'parva-snan',
    description: 'Secondary auspicious bathing day.',
    sourceUrl: 'https://nashikkumbhmela.co.in/dates-and-schedule/'
  },
  {
    id: 'kartik-purnima',
    date: '2027-11-14',
    title: 'Kartik Purnima (Dev Deepawali)',
    category: 'parva-snan',
    description: 'Festival of Lights — secondary auspicious bathing day with widespread lamp displays.',
    sourceUrl: 'https://memorableindia.com/blog/the-nashik-kumbh-mela-2027/'
  },
  {
    id: 'mauni-amavasya',
    date: '2028-01-26',
    title: 'Mauni Amavasya (Day of Silence)',
    category: 'parva-snan',
    description: 'Secondary auspicious bathing day observed in silence.',
    sourceUrl: 'https://nashikkumbhmela.co.in/dates-and-schedule/'
  },
  {
    id: 'maha-shivratri',
    date: '2028-02-23',
    title: 'Maha Shivratri',
    category: 'parva-snan',
    location: 'Massive focus on Trimbakeshwar',
    description: 'Secondary auspicious bathing day with major activity concentrated at Trimbakeshwar.',
    sourceUrl: 'https://nashikkumbhmela.co.in/dates-and-schedule/'
  },
  {
    id: 'ganga-dussehra',
    date: '2028-05-25',
    endDate: '2028-06-02',
    title: 'Ganga Dussehra',
    category: 'parva-snan',
    description: '10-day celebration of the river’s descent.',
    sourceUrl: 'https://nashikkumbhmela.co.in/dates-and-schedule/'
  },
  {
    id: 'flag-lowering',
    date: '2028-07-24',
    title: 'Flag Lowering (Mela Conclusion)',
    category: 'milestone',
    description: 'The ceremonial closing ceremony marking the official end of the 21-month Simhastha period.',
    sourceUrl: 'https://nashikkumbhmela.co.in/dates-and-schedule/'
  }
];

export function eventsOnDate(iso: string): CalendarEvent[] {
  return KUMBH_CALENDAR.filter((e) => {
    const end = e.endDate ?? e.date;
    return iso >= e.date && iso <= end;
  });
}
