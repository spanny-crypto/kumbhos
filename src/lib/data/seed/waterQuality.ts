import type { WaterQualityRecord } from '@/lib/data/types';

// Real, publicly reported figures — not synthetic. Sourced from CPCB /
// state Pollution Control Board reports, NGT filings, and a peer-reviewed
// pre-Kumbh sampling study, as cited per record. Where reports genuinely
// conflicted (2025 Prayagraj — CPCB's own position shifted over the course
// of the mela), both readings are kept rather than picking a side, and the
// record is marked DISPUTED. This is a starting set — Command Centre staff
// can add, correct, or extend these via /command/water-quality as new
// official reports are published.
//
// Official reference standard cited throughout: CPCB "Primary Water
// Quality Criteria for Bathing Water" (Class B designated-best-use) —
// pH 6.5–8.5, dissolved oxygen ≥5 mg/L, BOD ≤3 mg/L, fecal coliform
// desirable ≤500 MPN/100mL, maximum permissible ≤2500 MPN/100mL.
export function generateWaterQualityRecords(): WaterQualityRecord[] {
  const now = new Date().toISOString();
  const records: Omit<WaterQualityRecord, 'updatedAt' | 'updatedBy'>[] = [
    {
      id: 'wq-2019-prayagraj',
      kumbhEvent: 'Ardh Kumbh 2019 — Prayagraj',
      year: 2019,
      location: 'Sangam area, Ganga (upstream & downstream) and Yamuna',
      samplingPeriod: 'January 2019',
      ph: null,
      dissolvedOxygenMgL: null,
      bodMgL: null,
      fecalColiformMpn100ml: { min: 1000, max: 20000 },
      bathingStandardVerdict: 'EXCEEDS_STANDARD',
      riskLevel: 'HIGH',
      summary:
        'UP Pollution Control Board found Ganga (downstream) fecal coliform at 20,000 MPN/100mL — 40× the 500 MPN/100mL bathing limit. Ganga (upstream) measured 17,000 MPN/100mL; Yamuna measured 1,000 MPN/100mL. The Board\'s own scientific officer stated the river was unfit for bathing despite official "Nirmal Jal" (clean water) claims.',
      notes: 'pH/DO/BOD figures for this year were not found in the reporting reviewed; only fecal coliform was documented.',
      sourcePublisher: 'Hindustan Times (UP Pollution Control Board report)',
      sourceUrl: 'https://www.pressreader.com/india/hindustan-times-lucknow/20190228/281775630451444',
      sourceDate: '2019-02-28',
      dataSource: 'GOVERNMENT_OPEN_DATA'
    },
    {
      id: 'wq-2021-haridwar',
      kumbhEvent: 'Kumbh Mela 2021 — Haridwar',
      year: 2021,
      location: '8 monitoring locations incl. Triveni Ghat (Rishikesh) & Har ki Pauri (Haridwar)',
      samplingPeriod: 'Pre-Kumbh sampling study, early 2021',
      ph: { min: 7.7, max: 7.9 },
      dissolvedOxygenMgL: { min: 5.8, max: 8.9 },
      bodMgL: { min: 0, max: 1.4 },
      fecalColiformMpn100ml: { min: 330, max: 35000 },
      bathingStandardVerdict: 'PARTIAL',
      riskLevel: 'MODERATE',
      summary:
        'pH, dissolved oxygen and BOD met bathing-water criteria at all 8 monitored locations. Fecal coliform met the standard everywhere except two locations — Triveni Ghat (Rishikesh) and downstream of Har ki Pauri (Haridwar) — which exceeded it. A separate study found water "extremely contaminated" during major mass-bathing days (Somvati Amavasya, Maghi Poornima, Maha Shivratri, Baisakhi).',
      notes: 'Peer-reviewed academic sampling study, not a regulatory filing — methodology and dates differ from the CPCB/NGT-style reports for other years.',
      sourcePublisher: 'Study of Water Quality of Ganga River and Its Suitability for Mass Ritualistic Bathing before Kumbh Mela-2021 at Haridwar (ResearchGate / gyanganga.ai)',
      sourceUrl: 'https://www.researchgate.net/publication/364278465_Study_of_Water_Quality_of_Ganga_River_and_Its_Suitability_for_Mass_Ritualistic_Bathing_before_Kumbh_Mela-2021_at_Haridwar_in_Uttarakhand_India',
      sourceDate: '2021-08-01',
      dataSource: 'DERIVED'
    },
    {
      id: 'wq-2025-prayagraj-early',
      kumbhEvent: 'Maha Kumbh 2025 — Prayagraj (early mela)',
      year: 2025,
      location: 'Sangam and multiple Ganga/Yamuna monitoring points',
      samplingPeriod: '12–20 January 2025',
      ph: null,
      dissolvedOxygenMgL: null,
      bodMgL: null,
      fecalColiformMpn100ml: { min: 33000, max: 700000 },
      bathingStandardVerdict: 'EXCEEDS_STANDARD',
      riskLevel: 'HIGH',
      summary:
        'CPCB samples from 12–19 Jan 2025 found fecal coliform escalating to 700,000 MPN/100mL in the Ganga and 330,000 MPN/100mL in the Yamuna — roughly 1,400× and 660× the 500 MPN/100mL safe-bathing limit. On 20 Jan, Sangam (Ganga) measured 49,000 MPN/100mL and Yamuna 33,000 MPN/100mL.',
      notes: 'CPCB\'s own assessment of this same mela shifted significantly over time — see the separate 28 Feb 2025 record below for the later, more favorable reading and the "median value" methodology it used.',
      sourcePublisher: 'CPCB report to NGT, via Business Standard / LiveLaw / Bar and Bench',
      sourceUrl: 'https://www.livelaw.in/environment/cpcb-high-levels-faecal-bacteria-river-water-prayagraj-maha-kumbh-ngt-284324',
      sourceDate: '2025-02-17',
      dataSource: 'GOVERNMENT_OPEN_DATA'
    },
    {
      id: 'wq-2025-prayagraj-feb4',
      kumbhEvent: 'Maha Kumbh 2025 — Prayagraj (peak bathing day)',
      year: 2025,
      location: 'Ganga mainstem and Sangam',
      samplingPeriod: '4 February 2025',
      ph: null,
      dissolvedOxygenMgL: null,
      bodMgL: null,
      fecalColiformMpn100ml: { min: 7900, max: 11000 },
      bathingStandardVerdict: 'EXCEEDS_STANDARD',
      riskLevel: 'HIGH',
      summary:
        'On 4 Feb 2025, CPCB recorded fecal coliform at 11,000 MPN/100mL in the Ganga and 7,900 MPN/100mL at Sangam — both well above the 2,500 MPN/100mL maximum permissible limit, let alone the 500 MPN/100mL desirable limit.',
      notes: 'A single-day spot reading, part of the same CPCB monitoring campaign as the other 2025 Prayagraj records.',
      sourcePublisher: 'CPCB report to NGT, via ETV Bharat',
      sourceUrl: 'https://www.etvbharat.com/en/!bharat/amid-prayagraj-maha-kumbh-cpcb-report-questions-gangajal-purity-experts-rubbish-claims-enn25022202182',
      sourceDate: '2025-02-22',
      dataSource: 'GOVERNMENT_OPEN_DATA'
    },
    {
      id: 'wq-2025-prayagraj-median',
      kumbhEvent: 'Maha Kumbh 2025 — Prayagraj (full-mela median, later CPCB report)',
      year: 2025,
      location: 'Multiple Ganga/Yamuna monitoring points, mela-wide',
      samplingPeriod: '12 January – 22 February 2025',
      ph: null,
      dissolvedOxygenMgL: null,
      bodMgL: null,
      fecalColiformMpn100ml: 1700,
      bathingStandardVerdict: 'DISPUTED',
      riskLevel: 'DISPUTED',
      summary:
        'In a later report to the NGT (28 Feb 2025), CPCB cited a mela-wide median fecal coliform of 1,700 MPN/100mL — below the 2,500 MPN/100mL maximum permissible limit (though still above the 500 MPN/100mL desirable limit) — and characterized water at several locations as "within permissible limits for bathing," citing natural variability between samples. This directly followed CPCB\'s own earlier reports (see above) documenting readings up to 700,000 MPN/100mL, which Tribune India described as CPCB "taking a U-turn." The Union Environment Minister separately told Parliament the water was "fit to bathe."',
      notes:
        'This record intentionally documents a genuine, still-debated dispute rather than picking a side: the same regulator issued materially different assessments of the same event depending on methodology (single-sample peaks vs. mela-wide median) and timing. Treat both this record and the two above as parts of one unresolved picture, not as superseding each other.',
      sourcePublisher: 'CPCB report to NGT, via Deccan Herald / Tribune India',
      sourceUrl: 'https://www.tribuneindia.com/news/india/cpcb-takes-u-turn-on-maha-kumbh-water-quality',
      sourceDate: '2025-02-28',
      dataSource: 'GOVERNMENT_OPEN_DATA'
    },
    {
      id: 'wq-2025-prayagraj-parliament',
      kumbhEvent: 'Maha Kumbh 2025 — Prayagraj (Parliament / 8-location monitoring)',
      year: 2025,
      location: '8 key monitoring locations, Prayagraj',
      samplingPeriod: 'Full mela period 2025',
      ph: null,
      dissolvedOxygenMgL: null,
      bodMgL: null,
      fecalColiformMpn100ml: null,
      bathingStandardVerdict: 'DISPUTED',
      riskLevel: 'DISPUTED',
      summary:
        'The government told Parliament that monitoring at 8 key locations showed pH, dissolved oxygen, BOD and fecal coliform "within acceptable limits throughout" the festivities, and that the Ganga "remained within safe limits" after Maha Kumbh. This is the official government position; it sits alongside CPCB\'s own earlier field reports of extreme fecal coliform spikes (see records above).',
      notes: 'Exact numeric pH/DO/BOD/FC figures for this specific parliamentary statement were not available in the reporting reviewed — only the qualitative "within limits" characterization. Numbers can be added here once a primary document is located.',
      sourcePublisher: 'Union Government statement to Parliament, via Deccan Herald',
      sourceUrl: 'https://www.deccanherald.com/amp/story/india%2Fcentre-assures-ganga-remained-within-safe-limits-after-maha-kumbh-3646884',
      sourceDate: '2025-03-01',
      dataSource: 'GOVERNMENT_OPEN_DATA'
    }
  ];

  return records.map((r) => ({ ...r, updatedAt: now, updatedBy: null }));
}

export const WATER_QUALITY_STANDARD = {
  publisher: 'Central Pollution Control Board (CPCB), India',
  name: 'Primary Water Quality Criteria for Bathing Water (Class B designated best use)',
  sourceUrl: 'https://cpcb.nic.in/wqm/',
  ph: '6.5 – 8.5',
  dissolvedOxygenMgL: '≥ 5 mg/L',
  bodMgL: '≤ 3 mg/L',
  fecalColiformDesirableMpn100ml: '≤ 500 MPN/100mL',
  fecalColiformMaxPermissibleMpn100ml: '≤ 2,500 MPN/100mL'
};
