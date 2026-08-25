// Minimal, honest i18n: covers chrome-level and page-heading strings (nav,
// topbar, dashboard card titles, page titles/subtitles, common buttons)
// that are safe to hand-translate once and reuse everywhere. Dynamically
// generated content (AI answers, pressure-index "reason" sentences,
// incident/seed-data descriptions) is NOT translated — this app does not
// claim full multilingual coverage. A real BHASHINI-style integration is
// documented as future work in docs/ARCHITECTURE.md. The Live Billboard
// page intentionally stays English/terminal-styled — it's a distinct "ops
// terminal" register, not part of the translated consumer chrome.
export type Lang = 'en' | 'mr';

export const dictionary = {
  appName: { en: 'KumbhOS', mr: 'KumbhOS' },
  appTagline: { en: 'Crowd & Infrastructure Intelligence', mr: 'गर्दी आणि पायाभूत सुविधा गुप्तचर यंत्रणा' },
  enableTracking: { en: 'Enable live tracking', mr: 'लाइव्ह ट्रॅकिंग सुरू करा' },
  trackingOn: { en: 'Live tracking on', mr: 'लाइव्ह ट्रॅकिंग सुरू आहे' },
  sos: { en: 'SOS', mr: 'एसओएस' },

  navHome: { en: 'Dashboard', mr: 'डॅशबोर्ड' },
  navBillboard: { en: 'Live Billboard', mr: 'लाइव्ह बिलबोर्ड' },
  navLiveMap: { en: 'Live Map', mr: 'लाइव्ह नकाशा' },
  navCrowd: { en: 'Crowd Safety', mr: 'गर्दी सुरक्षा' },
  navNavigation: { en: 'Trip Planner', mr: 'प्रवास नियोजक' },
  navFacilities: { en: 'Facilities', mr: 'सुविधा' },
  navWaterQuality: { en: 'Water Quality', mr: 'पाणी गुणवत्ता' },
  navEmergency: { en: 'Emergency', mr: 'आणीबाणी' },
  navLostFound: { en: 'Lost & Found', mr: 'हरवले-सापडले' },
  navEvents: { en: 'Events', mr: 'कार्यक्रम' },
  navAssistant: { en: 'AI Assistant', mr: 'एआय सहाय्यक' },
  navDataSources: { en: 'Data Sources', mr: 'डेटा स्रोत' },
  navCommand: { en: 'Command Centre', mr: 'कमांड सेंटर' },

  dashboardTitle: { en: 'Dashboard', mr: 'डॅशबोर्ड' },
  dashboardSubtitle: { en: 'Real-time Kumbh Mela monitoring & management', mr: 'रिअल-टाइम कुंभ मेळा देखरेख आणि व्यवस्थापन' },
  announcementsHeading: { en: 'Announcements', mr: 'घोषणा' },

  cardCrowdDensity: { en: 'Crowd Density', mr: 'गर्दीची घनता' },
  cardParking: { en: 'Parking', mr: 'पार्किंग' },
  cardWaterPoints: { en: 'Water Points', mr: 'पाणी केंद्रे' },
  cardHospitals: { en: 'Hospitals', mr: 'रुग्णालये' },
  cardRoadsBridges: { en: 'Roads & Bridges', mr: 'रस्ते आणि पूल' },
  cardSanitation: { en: 'Sanitation', mr: 'स्वच्छता' },
  cardActiveAlerts: { en: 'Active Alerts', mr: 'सक्रिय सूचना' },
  cardLostFound: { en: 'Lost & Found', mr: 'हरवले-सापडले' },

  captionSectorsMonitored: { en: 'sectors monitored', mr: 'विभागांवर देखरेख' },
  captionNormal: { en: 'Normal', mr: 'सामान्य' },
  captionCritical: { en: 'critical', mr: 'गंभीर' },
  captionLotsOperational: { en: 'lots operational', mr: 'पार्किंग सुरू आहेत' },
  captionPointsOperational: { en: 'points operational', mr: 'केंद्रे सुरू आहेत' },
  captionFacilitiesOperational: { en: 'facilities operational', mr: 'सुविधा सुरू आहेत' },
  captionAssetsOperational: { en: 'assets operational', mr: 'मालमत्ता सुरू आहेत' },
  captionToiletsAvailable: { en: 'toilets available', mr: 'शौचालये उपलब्ध' },
  captionIncidentsInProgress: { en: 'incidents in progress', mr: 'घटना सुरू आहेत' },
  captionOpenCases: { en: 'open cases', mr: 'प्रलंबित प्रकरणे' },

  statusSafe: { en: 'Safe', mr: 'सुरक्षित' },
  statusModerate: { en: 'Moderate', mr: 'मध्यम' },
  statusCritical: { en: 'Critical', mr: 'गंभीर' },

  riskNormal: { en: 'Normal', mr: 'सामान्य' },
  riskBuilding: { en: 'Building', mr: 'वाढत आहे' },
  riskCritical: { en: 'Critical', mr: 'गंभीर' },
  riskIntervention: { en: 'Intervention Required', mr: 'हस्तक्षेप आवश्यक' },

  sosTitle: { en: 'Emergency SOS', mr: 'आणीबाणी एसओएस' },
  sosCallPolice: { en: 'Call Police (112)', mr: 'पोलिसांना कॉल करा (112)' },
  sosCallAmbulance: { en: 'Call Ambulance (108)', mr: 'रुग्णवाहिकेला कॉल करा (108)' },
  sosShareLocation: { en: 'Share Location', mr: 'स्थान शेअर करा' },
  sosCancel: { en: 'Cancel', mr: 'रद्द करा' },
  sosDisclaimer: {
    en: 'Prototype only — not connected to real emergency services. These buttons dial your phone’s real emergency numbers.',
    mr: 'केवळ प्रोटोटाइप — खऱ्या आणीबाणी सेवांशी जोडलेले नाही. ही बटणे तुमच्या फोनचे खरे आणीबाणी क्रमांक डायल करतात.'
  },

  pageLiveMapTitle: { en: 'Live Crowd Map', mr: 'लाइव्ह गर्दी नकाशा' },
  pageLiveMapSubtitle: { en: 'Zones colored by prototype crowd pressure. Updates automatically.', mr: 'प्रोटोटाइप गर्दी दाबानुसार रंगीत विभाग. आपोआप अद्ययावत होते.' },

  pageCrowdTitle: { en: 'Crowd Pressure Index', mr: 'गर्दी दाब निर्देशांक' },
  pageCrowdSubtitle: { en: 'Prototype risk model — density × movement × conflict × capacity × growth.', mr: 'प्रोटोटाइप जोखीम मॉडेल — घनता × हालचाल × संघर्ष × क्षमता × वाढ.' },

  pageNavigationTitle: { en: 'Dynamic Navigation', mr: 'गतिमान मार्गदर्शन' },
  pageNavigationSubtitle: {
    en: 'Straight-line estimate weighted by current crowd pressure — not turn-by-turn routing.',
    mr: 'सध्याच्या गर्दी दाबानुसार सरळ-रेषा अंदाज — टर्न-बाय-टर्न मार्गदर्शन नाही.'
  },

  pageFacilitiesTitle: { en: 'Facilities', mr: 'सुविधा' },
  pageFacilitiesSubtitle: { en: 'Infrastructure asset status across all sectors.', mr: 'सर्व विभागांमधील पायाभूत सुविधांची स्थिती.' },

  pageEmergencyTitle: { en: 'Emergency Information', mr: 'आणीबाणी माहिती' },

  pageLostFoundTitle: { en: 'Lost & Found', mr: 'हरवले आणि सापडले' },
  pageLostFoundSubtitle: {
    en: 'A privacy-conscious coordination layer. No facial recognition is used — every match requires human staff verification before reunification.',
    mr: 'गोपनीयता-सजग समन्वय स्तर. चेहरा ओळख तंत्रज्ञान वापरले जात नाही — पुनर्मिलनापूर्वी प्रत्येक जुळणीसाठी कर्मचाऱ्यांची पडताळणी आवश्यक आहे.'
  },

  pageEventsTitle: { en: 'Events', mr: 'कार्यक्रम' },
  pageEventsSubtitle: { en: 'Scheduled programme for the gathering.', mr: 'मेळाव्यासाठी नियोजित कार्यक्रम.' },

  pageAssistantTitle: { en: 'AI Kumbh Assistant', mr: 'एआय कुंभ सहाय्यक' },
  pageAssistantSubtitle: {
    en: "Answers are grounded in KumbhOS structured data. It will say so when live information isn't available.",
    mr: 'उत्तरे KumbhOS च्या संरचित डेटावर आधारित असतात. लाइव्ह माहिती उपलब्ध नसल्यास ते तसे स्पष्ट सांगेल.'
  },

  pageDataSourcesTitle: { en: 'Data Transparency', mr: 'डेटा पारदर्शकता' },
  pageDataSourcesSubtitle: {
    en: 'Every figure in KumbhOS is traceable to a source. Nothing simulated is ever presented as live government data.',
    mr: 'KumbhOS मधील प्रत्येक आकडा स्रोतापर्यंत शोधता येतो. सिम्युलेटेड डेटा कधीही थेट सरकारी डेटा म्हणून दाखवला जात नाही.'
  }
} satisfies Record<string, Record<Lang, string>>;

export type DictionaryKey = keyof typeof dictionary;
