// Curated tourist/heritage guide content for Nashik–Trimbakeshwar. This is
// static editorial content (real places, real history, written in our own
// words) — not live or synthetic data, so it does not carry a DemoDataBadge
// and never expires or needs polling. Emoji stand in for photos since we
// don't have a real photo library to ship; swap in real images if/when the
// team has rights-cleared photography.
export type GuideCategory = 'temple' | 'ghat' | 'nature' | 'museum' | 'modern' | 'heritage';

export interface GuideEntry {
  id: string;
  name: string;
  category: GuideCategory;
  emoji: string;
  location: string;
  history: string;
  whyVisit: string;
}

export const GUIDE_CATEGORY_LABELS: Record<GuideCategory, string> = {
  temple: 'Temple',
  ghat: 'Ghat / Riverfront',
  nature: 'Nature & Trekking',
  museum: 'Museum',
  modern: 'Modern Attraction',
  heritage: 'Heritage Area'
};

export const NASHIK_GUIDE: GuideEntry[] = [
  {
    id: 'trimbakeshwar',
    name: 'Trimbakeshwar Shiva Temple',
    category: 'temple',
    emoji: '🛕',
    location: 'Trimbak, ~28 km from Nashik city',
    history:
      'One of the twelve Jyotirlingas of Lord Shiva, built in its present black-stone form by Peshwa Balaji Baji Rao in the 18th century. The Godavari river is traditionally believed to originate at nearby Brahmagiri hill, which is why Nashik–Trimbakeshwar hosts the Kumbh Mela every twelve years.',
    whyVisit: 'The reason the Kumbh comes to this region at all — the spiritual center of the whole event. Intricate stone carving, and the Brahmagiri hill trek starts close by.'
  },
  {
    id: 'ramkund',
    name: 'Ramkund',
    category: 'ghat',
    emoji: '🙏',
    location: 'Panchavati, Nashik city',
    history:
      'A sacred bathing tank on the Godavari believed to be where Lord Rama bathed during his years of exile. It is one of the most important ghats for ritual bathing during the Kumbh Mela, and ashes of several notable historical figures have been immersed here.',
    whyVisit: 'The most visited ghat in Nashik city — expect the heaviest crowds here during Kumbh bathing dates.'
  },
  {
    id: 'kalaram-mandir',
    name: 'Kalaram Mandir',
    category: 'temple',
    emoji: '⚫',
    location: 'Panchavati, Nashik city',
    history:
      'A black-stone temple dedicated to Lord Rama, built in 1794. It is historically significant well beyond religion: in 1930, Dr. B.R. Ambedkar led the Kalaram Mandir Satyagraha here, a landmark protest demanding temple entry rights for Dalits.',
    whyVisit: 'Striking all-black stone architecture and a genuinely important place in India’s social history, not just its religious history.'
  },
  {
    id: 'panchavati',
    name: 'Panchavati',
    category: 'heritage',
    emoji: '🌳',
    location: 'North bank of the Godavari, Nashik city',
    history:
      'Named for five ancient banyan trees ("panch" + "vati"), this riverside neighborhood is where the Ramayana describes Rama, Sita, and Lakshmana living during part of their exile. Several of the city’s oldest temples and ghats — Ramkund, Kalaram Mandir, Sita Gufa — are clustered here.',
    whyVisit: 'The historic core of pilgrim Nashik — most heritage sites on this list are walkable from here.'
  },
  {
    id: 'sita-gufa',
    name: 'Sita Gufa (Sita Cave)',
    category: 'temple',
    emoji: '🕳️',
    location: 'Panchavati, next to Kalaram Mandir',
    history:
      'A narrow underground cave shrine associated with Sita’s time in exile. Visitors descend through a tight stone passage to small idols of Rama, Sita, and Lakshmana inside.',
    whyVisit: 'A short but memorable stop right next to Kalaram Mandir — note the passage is narrow and low.'
  },
  {
    id: 'kapaleshwar',
    name: 'Kapaleshwar Mahadev Temple',
    category: 'temple',
    emoji: '🔱',
    location: 'Panchavati, on the Godavari bank',
    history:
      'One of the oldest Shiva temples in Nashik. Unusually for a Shiva temple, it has no Nandi (bull) idol at its entrance — local tradition explains this through a story tied to the temple’s founding legend.',
    whyVisit: 'A quieter, older alternative to the busier ghats, with genuine architectural age.'
  },
  {
    id: 'someshwar',
    name: 'Someshwar Temple & Ghat',
    category: 'ghat',
    emoji: '🌊',
    location: 'Someshwar, south of Nashik city along the Godavari',
    history:
      'A riverside Shiva temple set in a landscaped garden on the Godavari, popular as a calmer, greener counterpoint to the crowded city ghats. It also appears in the city’s Kumbh-era holding-area planning as a riverside gathering space.',
    whyVisit: 'The best spot for a quiet riverside walk away from the main pilgrim crowds.'
  },
  {
    id: 'anjaneri',
    name: 'Anjaneri Hills',
    category: 'nature',
    emoji: '⛰️',
    location: 'Near Trimbakeshwar, ~20 km from Nashik city',
    history:
      'A range of hills widely believed in local tradition to be the birthplace of Lord Hanuman. The area is also a well-known trekking and rock-climbing destination in the Sahyadri range, with the ruins of an old fort at the summit.',
    whyVisit: 'The trek for anyone who wants a Sahyadri hill climb alongside the pilgrimage — plan a half-day for it.'
  },
  {
    id: 'coin-museum',
    name: 'Indian Institute of Research in Numismatic Studies (Coin Museum)',
    category: 'museum',
    emoji: '🪙',
    location: 'Anjaneri, near Trimbakeshwar',
    history:
      'India’s only dedicated coin museum, run by the Indian Institute of Research in Numismatic Studies. It houses coins spanning from ancient punch-marked currency through Mughal, Maratha, and colonial-era money.',
    whyVisit: 'A genuinely unique stop for history buffs — there is nothing else quite like it in the country.'
  },
  {
    id: 'sula-vineyards',
    name: 'Sula Vineyards',
    category: 'modern',
    emoji: '🍇',
    location: 'Gangapur, ~15 km from Nashik city',
    history:
      'Nashik is often called the "Wine Capital of India," and Sula is the vineyard that put it on the map, opening in the early 2000s. It runs vineyard tours, tastings, and an annual music festival (SulaFest).',
    whyVisit: 'A completely different side of Nashik for travelers combining the pilgrimage with a longer regional trip.'
  },
  {
    id: 'muktidham',
    name: 'Muktidham Temple',
    category: 'temple',
    emoji: '⛩️',
    location: 'Nashik city, near Gangapur Road',
    history:
      'A modern (1971) all-white marble temple built to replicate all twelve Jyotirlingas of Shiva in one complex, along with engravings of the full Bhagavad Gita on its walls.',
    whyVisit: 'A striking, modern marble structure — a good contrast to the older stone temples elsewhere on this list.'
  },
  {
    id: 'naroshankar',
    name: 'Naroshankar Temple',
    category: 'temple',
    emoji: '🔔',
    location: 'Old Nashik city, near Ramkund',
    history:
      'A Shiva temple built in Peshwa-era architectural style, known for the large bronze bell hanging at its entrance — reputedly seized from a Portuguese ship by Maratha forces and later installed here.',
    whyVisit: 'The bell alone is worth the short detour, and the temple sits right in the old-city heritage cluster.'
  }
];
