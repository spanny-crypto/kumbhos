// Minimal, honest i18n: covers chrome-level and page-heading strings (nav,
// topbar, dashboard card titles, page titles/subtitles, common buttons,
// form labels, status/enum labels) that are safe to hand-translate once and
// reuse everywhere. Seed/demo data content (zone names, incident
// descriptions, water-quality summaries, etc.) is translated separately —
// see src/lib/i18n/seedTranslations.ts — since it lives in the data layer,
// not this chrome dictionary. AI assistant answers are translated at the
// point they're generated (src/lib/ai/*) via the current language, not here.
// The Live Billboard page intentionally stays English/terminal-styled — a
// distinct "ops terminal" register, not part of the translated chrome.
export type Lang = 'en' | 'hi' | 'mr';

export const LANG_LABELS: Record<Lang, string> = { en: 'English', hi: 'हिन्दी', mr: 'मराठी' };

export const dictionary = {
  appName: { en: 'KumbhOS', hi: 'KumbhOS', mr: 'KumbhOS' },
  appTagline: { en: 'Crowd & Infrastructure Intelligence', hi: 'भीड़ और अवसंरचना बुद्धिमत्ता', mr: 'गर्दी आणि पायाभूत सुविधा गुप्तचर यंत्रणा' },
  enableTracking: { en: 'Enable live tracking', hi: 'लाइव ट्रैकिंग चालू करें', mr: 'लाइव्ह ट्रॅकिंग सुरू करा' },
  trackingOn: { en: 'Live tracking on', hi: 'लाइव ट्रैकिंग चालू है', mr: 'लाइव्ह ट्रॅकिंग सुरू आहे' },
  sos: { en: 'SOS', hi: 'एसओएस', mr: 'एसओएस' },
  language: { en: 'Language', hi: 'भाषा', mr: 'भाषा' },

  navHome: { en: 'Dashboard', hi: 'डैशबोर्ड', mr: 'डॅशबोर्ड' },
  navBillboard: { en: 'Live Billboard', hi: 'लाइव बिलबोर्ड', mr: 'लाइव्ह बिलबोर्ड' },
  navLiveMap: { en: 'Live Map', hi: 'लाइव मानचित्र', mr: 'लाइव्ह नकाशा' },
  navCrowd: { en: 'Crowd Safety', hi: 'भीड़ सुरक्षा', mr: 'गर्दी सुरक्षा' },
  navNavigation: { en: 'Trip Planner', hi: 'यात्रा योजनाकार', mr: 'प्रवास नियोजक' },
  navFacilities: { en: 'Facilities', hi: 'सुविधाएं', mr: 'सुविधा' },
  navWaterQuality: { en: 'Water Quality', hi: 'जल गुणवत्ता', mr: 'पाणी गुणवत्ता' },
  navWristband: { en: 'ID Wristband', hi: 'पहचान पट्टी', mr: 'ओळख पट्टी' },
  navEmergency: { en: 'Emergency', hi: 'आपातकाल', mr: 'आणीबाणी' },
  navLostFound: { en: 'Lost & Found', hi: 'खोया-पाया', mr: 'हरवले-सापडले' },
  navEvents: { en: 'Events', hi: 'कार्यक्रम', mr: 'कार्यक्रम' },
  navAssistant: { en: 'AI Assistant', hi: 'एआई सहायक', mr: 'एआय सहाय्यक' },
  navDataSources: { en: 'Data Sources', hi: 'डेटा स्रोत', mr: 'डेटा स्रोत' },
  navCommand: { en: 'Command Centre', hi: 'कमांड सेंटर', mr: 'कमांड सेंटर' },
  navPrivacy: { en: 'Privacy Policy', hi: 'गोपनीयता नीति', mr: 'गोपनीयता धोरण' },

  dashboardTitle: { en: 'Dashboard', hi: 'डैशबोर्ड', mr: 'डॅशबोर्ड' },
  dashboardSubtitle: { en: 'Real-time Kumbh Mela monitoring & management', hi: 'रीयल-टाइम कुंभ मेला निगरानी और प्रबंधन', mr: 'रिअल-टाइम कुंभ मेळा देखरेख आणि व्यवस्थापन' },
  announcementsHeading: { en: 'Announcements', hi: 'घोषणाएं', mr: 'घोषणा' },

  cardCrowdDensity: { en: 'Crowd Density', hi: 'भीड़ घनत्व', mr: 'गर्दीची घनता' },
  cardParking: { en: 'Parking', hi: 'पार्किंग', mr: 'पार्किंग' },
  cardWaterPoints: { en: 'Water Points', hi: 'जल केंद्र', mr: 'पाणी केंद्रे' },
  cardHospitals: { en: 'Hospitals', hi: 'अस्पताल', mr: 'रुग्णालये' },
  cardRoadsBridges: { en: 'Roads & Bridges', hi: 'सड़कें और पुल', mr: 'रस्ते आणि पूल' },
  cardSanitation: { en: 'Sanitation', hi: 'स्वच्छता', mr: 'स्वच्छता' },
  cardActiveAlerts: { en: 'Active Alerts', hi: 'सक्रिय चेतावनियां', mr: 'सक्रिय सूचना' },
  cardLostFound: { en: 'Lost & Found', hi: 'खोया-पाया', mr: 'हरवले-सापडले' },

  captionSectorsMonitored: { en: 'sectors monitored', hi: 'सेक्टरों की निगरानी', mr: 'विभागांवर देखरेख' },
  captionNormal: { en: 'Normal', hi: 'सामान्य', mr: 'सामान्य' },
  captionCritical: { en: 'critical', hi: 'गंभीर', mr: 'गंभीर' },
  captionLotsOperational: { en: 'lots operational', hi: 'पार्किंग स्थल चालू', mr: 'पार्किंग सुरू आहेत' },
  captionPointsOperational: { en: 'points operational', hi: 'केंद्र चालू', mr: 'केंद्रे सुरू आहेत' },
  captionFacilitiesOperational: { en: 'facilities operational', hi: 'सुविधाएं चालू', mr: 'सुविधा सुरू आहेत' },
  captionAssetsOperational: { en: 'assets operational', hi: 'संपत्तियां चालू', mr: 'मालमत्ता सुरू आहेत' },
  captionToiletsAvailable: { en: 'toilets available', hi: 'शौचालय उपलब्ध', mr: 'शौचालये उपलब्ध' },
  captionIncidentsInProgress: { en: 'incidents in progress', hi: 'घटनाएं जारी', mr: 'घटना सुरू आहेत' },
  captionOpenCases: { en: 'open cases', hi: 'लंबित मामले', mr: 'प्रलंबित प्रकरणे' },

  statusSafe: { en: 'Safe', hi: 'सुरक्षित', mr: 'सुरक्षित' },
  statusModerate: { en: 'Moderate', hi: 'मध्यम', mr: 'मध्यम' },
  statusCritical: { en: 'Critical', hi: 'गंभीर', mr: 'गंभीर' },

  riskNormal: { en: 'Normal', hi: 'सामान्य', mr: 'सामान्य' },
  riskBuilding: { en: 'Building', hi: 'बढ़ रहा है', mr: 'वाढत आहे' },
  riskCritical: { en: 'Critical', hi: 'गंभीर', mr: 'गंभीर' },
  riskIntervention: { en: 'Intervention Required', hi: 'हस्तक्षेप आवश्यक', mr: 'हस्तक्षेप आवश्यक' },

  sosTitle: { en: 'Emergency SOS', hi: 'आपातकालीन एसओएस', mr: 'आणीबाणी एसओएस' },
  sosCallPolice: { en: 'Call Police (112)', hi: 'पुलिस को कॉल करें (112)', mr: 'पोलिसांना कॉल करा (112)' },
  sosCallAmbulance: { en: 'Call Ambulance (108)', hi: 'एम्बुलेंस को कॉल करें (108)', mr: 'रुग्णवाहिकेला कॉल करा (108)' },
  sosShareLocation: { en: 'Share Location', hi: 'स्थान साझा करें', mr: 'स्थान शेअर करा' },
  sosCancel: { en: 'Cancel', hi: 'रद्द करें', mr: 'रद्द करा' },
  sosDisclaimer: {
    en: 'Prototype only — not connected to real emergency services. These buttons dial your phone’s real emergency numbers.',
    hi: 'केवल प्रोटोटाइप — वास्तविक आपातकालीन सेवाओं से जुड़ा नहीं है। ये बटन आपके फोन के असली आपातकालीन नंबर डायल करते हैं।',
    mr: 'केवळ प्रोटोटाइप — खऱ्या आणीबाणी सेवांशी जोडलेले नाही. ही बटणे तुमच्या फोनचे खरे आणीबाणी क्रमांक डायल करतात.'
  },

  pageLiveMapTitle: { en: 'Live Crowd Map', hi: 'लाइव भीड़ मानचित्र', mr: 'लाइव्ह गर्दी नकाशा' },
  pageLiveMapSubtitle: {
    en: 'Zones colored by prototype crowd pressure. Updates automatically.',
    hi: 'प्रोटोटाइप भीड़ दबाव के अनुसार रंगीन क्षेत्र। स्वतः अपडेट होता है।',
    mr: 'प्रोटोटाइप गर्दी दाबानुसार रंगीत विभाग. आपोआप अद्ययावत होते.'
  },

  pageCrowdTitle: { en: 'Crowd Pressure Index', hi: 'भीड़ दबाव सूचकांक', mr: 'गर्दी दाब निर्देशांक' },
  pageCrowdSubtitle: {
    en: 'Prototype risk model — density × movement × conflict × capacity × growth.',
    hi: 'प्रोटोटाइप जोखिम मॉडल — घनत्व × गति × टकराव × क्षमता × वृद्धि.',
    mr: 'प्रोटोटाइप जोखीम मॉडेल — घनता × हालचाल × संघर्ष × क्षमता × वाढ.'
  },

  pageNavigationTitle: { en: 'Dynamic Navigation', hi: 'गतिशील मार्गदर्शन', mr: 'गतिमान मार्गदर्शन' },
  pageNavigationSubtitle: {
    en: 'Straight-line estimate weighted by current crowd pressure — not turn-by-turn routing.',
    hi: 'वर्तमान भीड़ दबाव के अनुसार सीधी-रेखा अनुमान — टर्न-बाय-टर्न मार्गदर्शन नहीं.',
    mr: 'सध्याच्या गर्दी दाबानुसार सरळ-रेषा अंदाज — टर्न-बाय-टर्न मार्गदर्शन नाही.'
  },

  pageFacilitiesTitle: { en: 'Facilities', hi: 'सुविधाएं', mr: 'सुविधा' },
  pageFacilitiesSubtitle: { en: 'Infrastructure asset status across all sectors.', hi: 'सभी सेक्टरों में अवसंरचना संपत्ति की स्थिति.', mr: 'सर्व विभागांमधील पायाभूत सुविधांची स्थिती.' },

  pageEmergencyTitle: { en: 'Emergency Information', hi: 'आपातकालीन जानकारी', mr: 'आणीबाणी माहिती' },

  pageLostFoundTitle: { en: 'Lost & Found', hi: 'खोया और पाया', mr: 'हरवले आणि सापडले' },
  pageLostFoundSubtitle: {
    en: 'A privacy-conscious coordination layer. No facial recognition is used — every match requires human staff verification before reunification.',
    hi: 'एक गोपनीयता-सजग समन्वय स्तर. चेहरा पहचान तकनीक का उपयोग नहीं किया जाता — पुनर्मिलन से पहले हर मिलान के लिए कर्मचारियों की पुष्टि आवश्यक है.',
    mr: 'गोपनीयता-सजग समन्वय स्तर. चेहरा ओळख तंत्रज्ञान वापरले जात नाही — पुनर्मिलनापूर्वी प्रत्येक जुळणीसाठी कर्मचाऱ्यांची पडताळणी आवश्यक आहे.'
  },

  pageEventsTitle: { en: 'Events', hi: 'कार्यक्रम', mr: 'कार्यक्रम' },
  pageEventsSubtitle: { en: 'Scheduled programme for the gathering.', hi: 'मेले के लिए निर्धारित कार्यक्रम.', mr: 'मेळाव्यासाठी नियोजित कार्यक्रम.' },

  pageAssistantTitle: { en: 'AI Kumbh Assistant', hi: 'एआई कुंभ सहायक', mr: 'एआय कुंभ सहाय्यक' },
  pageAssistantSubtitle: {
    en: "Answers are grounded in KumbhOS structured data. It will say so when live information isn't available.",
    hi: 'उत्तर KumbhOS के संरचित डेटा पर आधारित होते हैं. लाइव जानकारी उपलब्ध न होने पर यह स्पष्ट रूप से बताएगा.',
    mr: 'उत्तरे KumbhOS च्या संरचित डेटावर आधारित असतात. लाइव्ह माहिती उपलब्ध नसल्यास ते तसे स्पष्ट सांगेल.'
  },

  pageDataSourcesTitle: { en: 'Data Transparency', hi: 'डेटा पारदर्शिता', mr: 'डेटा पारदर्शकता' },
  pageDataSourcesSubtitle: {
    en: 'Every figure in KumbhOS is traceable to a source. Nothing simulated is ever presented as live government data.',
    hi: 'KumbhOS में हर आंकड़ा एक स्रोत तक खोजा जा सकता है. सिम्युलेटेड डेटा को कभी भी लाइव सरकारी डेटा के रूप में प्रस्तुत नहीं किया जाता.',
    mr: 'KumbhOS मधील प्रत्येक आकडा स्रोतापर्यंत शोधता येतो. सिम्युलेटेड डेटा कधीही थेट सरकारी डेटा म्हणून दाखवला जात नाही.'
  },

  pageWristbandTitle: { en: 'ID Wristband', hi: 'पहचान पट्टी', mr: 'ओळख पट्टी' },
  pageWristbandSubtitle: {
    en: "Make a printable QR wristband for a child or elderly relative in under a minute. Anyone who finds them can scan it and call you immediately — no app, no login.",
    hi: 'एक मिनट से भी कम समय में बच्चे या बुजुर्ग रिश्तेदार के लिए प्रिंट करने योग्य क्यूआर पट्टी बनाएं. उन्हें पाने वाला कोई भी व्यक्ति इसे स्कैन करके तुरंत आपको कॉल कर सकता है — कोई ऐप नहीं, कोई लॉगिन नहीं.',
    mr: 'मूल किंवा वृद्ध नातेवाईकासाठी एका मिनिटापेक्षा कमी वेळात छापण्यायोग्य क्यूआर पट्टी बनवा. त्यांना सापडणारी कोणतीही व्यक्ती ती स्कॅन करून तुम्हाला लगेच कॉल करू शकते — कोणतेही अ‍ॅप नाही, लॉगिन नाही.'
  },

  pagePrivacyTitle: { en: 'Privacy Policy', hi: 'गोपनीयता नीति', mr: 'गोपनीयता धोरण' },

  formFullName: { en: 'Full name', hi: 'पूरा नाम', mr: 'पूर्ण नाव' },
  formAge: { en: 'Age', hi: 'आयु', mr: 'वय' },
  formOptional: { en: 'Optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक' },
  formSubmit: { en: 'Submit', hi: 'जमा करें', mr: 'सादर करा' },
  formCancel: { en: 'Cancel', hi: 'रद्द करें', mr: 'रद्द करा' },
  formSaving: { en: 'Saving…', hi: 'सहेजा जा रहा है…', mr: 'जतन करत आहे…' },

  wordRisk: { en: 'risk', hi: 'जोखिम', mr: 'धोका' },
  filterAll: { en: 'All', hi: 'सभी', mr: 'सर्व' },
  labelPublisher: { en: 'Publisher', hi: 'प्रकाशक', mr: 'प्रकाशक' },
  labelSource: { en: 'Source', hi: 'स्रोत', mr: 'स्रोत' },
  labelLicense: { en: 'License', hi: 'लाइसेंस', mr: 'परवाना' },
  labelStatus: { en: 'Status', hi: 'स्थिति', mr: 'स्थिती' },
  labelRefresh: { en: 'Refresh', hi: 'रिफ्रेश', mr: 'रिफ्रेश' },

  lfReportType: { en: 'Report type', hi: 'रिपोर्ट प्रकार', mr: 'अहवाल प्रकार' },
  lfApproximateArea: { en: 'Approximate area', hi: 'अनुमानित क्षेत्र', mr: 'अंदाजे भाग' },
  lfSelectSector: { en: 'Select a sector…', hi: 'एक सेक्टर चुनें…', mr: 'एक विभाग निवडा…' },
  lfDescription: { en: 'Description', hi: 'विवरण', mr: 'वर्णन' },
  lfDescriptionPlaceholder: {
    en: 'Clothing, approximate age, distinguishing details, time last seen…',
    hi: 'कपड़े, अनुमानित उम्र, पहचान की विशेषताएं, आखिरी बार देखे जाने का समय…',
    mr: 'कपडे, अंदाजे वय, ओळखीची वैशिष्ट्ये, शेवटचे दिसल्याची वेळ…'
  },
  lfContactInfo: { en: 'Your contact information', hi: 'आपकी संपर्क जानकारी', mr: 'तुमची संपर्क माहिती' },
  lfContactPlaceholder: { en: 'Phone number or where staff can find you', hi: 'फोन नंबर या स्टाफ आपको कहां ढूंढ सकता है', mr: 'फोन नंबर किंवा कर्मचारी तुम्हाला कुठे शोधू शकतील' },
  lfSubmitting: { en: 'Submitting…', hi: 'सबमिट हो रहा है…', mr: 'सादर करत आहे…' },
  lfSubmitReport: { en: 'Submit report', hi: 'रिपोर्ट सबमिट करें', mr: 'अहवाल सादर करा' },
  lfSubmitSuccess: { en: 'Report submitted. Staff will review it shortly.', hi: 'रिपोर्ट सबमिट हो गई. स्टाफ जल्द ही इसकी समीक्षा करेगा.', mr: 'अहवाल सादर झाला. कर्मचारी लवकरच त्याचे पुनरावलोकन करतील.' },
  lfSubmitError: { en: 'Could not submit your report. Please try again.', hi: 'आपकी रिपोर्ट सबमिट नहीं हो सकी. कृपया पुनः प्रयास करें.', mr: 'तुमचा अहवाल सादर करता आला नाही. कृपया पुन्हा प्रयत्न करा.' },
  lfOpenCases: { en: 'Open cases', hi: 'खुले मामले', mr: 'खुली प्रकरणे' },
  lfNoOpenCases: { en: 'No open cases right now.', hi: 'अभी कोई खुला मामला नहीं है.', mr: 'सध्या कोणतीही खुली प्रकरणे नाहीत.' },
  lfReported: { en: 'Reported', hi: 'रिपोर्ट किया गया', mr: 'नोंदवले' },

  shareGetting: { en: 'Getting your location…', hi: 'आपका स्थान प्राप्त किया जा रहा है…', mr: 'तुमचे स्थान मिळवत आहे…' },
  shareShared: { en: 'Shared', hi: 'साझा किया गया', mr: 'शेअर केले' },
  shareCopied: { en: 'Google Maps link copied', hi: 'गूगल मैप्स लिंक कॉपी हो गई', mr: 'गूगल मॅप्स लिंक कॉपी झाली' },
  shareDenied: {
    en: 'Location permission denied — enable it in your browser/site settings',
    hi: 'स्थान अनुमति अस्वीकृत — इसे अपने ब्राउज़र/साइट सेटिंग्स में सक्षम करें',
    mr: 'स्थान परवानगी नाकारली — ती तुमच्या ब्राउझर/साइट सेटिंग्जमध्ये सुरू करा'
  },
  shareUnavailable: {
    en: "Couldn't determine your location — try again outdoors or with GPS on",
    hi: 'आपका स्थान निर्धारित नहीं हो सका — बाहर या जीपीएस चालू करके पुनः प्रयास करें',
    mr: 'तुमचे स्थान निश्चित करता आले नाही — बाहेर किंवा जीपीएस चालू करून पुन्हा प्रयत्न करा'
  },
  shareTimeout: { en: 'Location request timed out — try again', hi: 'स्थान अनुरोध समय सीमा समाप्त — पुनः प्रयास करें', mr: 'स्थान विनंतीची वेळ संपली — पुन्हा प्रयत्न करा' },
  shareUnsupported: { en: 'Geolocation is not supported on this device', hi: 'इस डिवाइस पर जियोलोकेशन समर्थित नहीं है', mr: 'या डिव्हाइसवर जिओलोकेशन समर्थित नाही' },
  sosBrowserSaid: { en: 'Browser said', hi: 'ब्राउज़र ने कहा', mr: 'ब्राउझरने सांगितले' },
  sosUnavailableHint: {
    en: 'Usually means your OS location service is off. Windows: Settings → Privacy & security → Location. macOS: System Settings → Privacy & Security → Location Services.',
    hi: 'आमतौर पर इसका मतलब है कि आपके OS की लोकेशन सेवा बंद है. Windows: सेटिंग्स → गोपनीयता और सुरक्षा → स्थान. macOS: सिस्टम सेटिंग्स → गोपनीयता और सुरक्षा → स्थान सेवाएं.',
    mr: 'सहसा याचा अर्थ तुमच्या OS ची लोकेशन सेवा बंद आहे. Windows: सेटिंग्ज → गोपनीयता आणि सुरक्षा → स्थान. macOS: सिस्टम सेटिंग्ज → गोपनीयता आणि सुरक्षा → स्थान सेवा.'
  },
  sosDeniedHint: {
    en: "Click the 🔒 icon in your address bar → Site settings → Location → Allow (Chrome/Edge), or Settings → Site settings → Location on this site (Chrome Android), then try again. It won't prompt again on its own once blocked.",
    hi: 'अपने एड्रेस बार में 🔒 आइकन पर क्लिक करें → साइट सेटिंग्स → स्थान → अनुमति दें (Chrome/Edge), या सेटिंग्स → साइट सेटिंग्स → इस साइट पर स्थान (Chrome Android), फिर पुनः प्रयास करें. एक बार ब्लॉक होने पर यह अपने आप दोबारा नहीं पूछेगा.',
    mr: 'तुमच्या अ‍ॅड्रेस बारमधील 🔒 आयकॉनवर क्लिक करा → साइट सेटिंग्ज → स्थान → परवानगी द्या (Chrome/Edge), किंवा सेटिंग्ज → साइट सेटिंग्ज → या साइटवर स्थान (Chrome Android), नंतर पुन्हा प्रयत्न करा. एकदा ब्लॉक झाल्यावर ते पुन्हा आपोआप विचारणार नाही.'
  },
  sosOpenMaps: { en: 'Open my location in Google Maps', hi: 'गूगल मैप्स में मेरा स्थान खोलें', mr: 'गूगल मॅप्समध्ये माझे स्थान उघडा' },

  navFromSector: { en: 'From sector', hi: 'सेक्टर से', mr: 'विभागापासून' },
  navLookingFor: { en: 'Looking for', hi: 'की तलाश में', mr: 'शोधत आहे' },
  navUseLocationTitle: {
    en: 'Uses your real device location — your browser will ask to confirm.',
    hi: 'आपके डिवाइस के वास्तविक स्थान का उपयोग करता है — आपका ब्राउज़र पुष्टि के लिए पूछेगा.',
    mr: 'तुमच्या डिव्हाइसचे खरे स्थान वापरते — तुमचा ब्राउझर पुष्टीसाठी विचारेल.'
  },
  navLocating: { en: 'Locating…', hi: 'स्थान खोजा जा रहा है…', mr: 'स्थान शोधत आहे…' },
  navUsingLocation: { en: 'Using your location', hi: 'आपका स्थान उपयोग हो रहा है', mr: 'तुमचे स्थान वापरत आहे' },
  navUseMyLocation: { en: 'Use my location', hi: 'मेरा स्थान उपयोग करें', mr: 'माझे स्थान वापरा' },
  navDeniedMsg: {
    en: "Location permission denied — pick your sector manually, or allow location in your browser's site settings and try again.",
    hi: 'स्थान अनुमति अस्वीकृत — अपना सेक्टर मैन्युअल रूप से चुनें, या अपने ब्राउज़र की साइट सेटिंग्स में स्थान की अनुमति दें और पुनः प्रयास करें.',
    mr: 'स्थान परवानगी नाकारली — तुमचा विभाग मॅन्युअली निवडा, किंवा तुमच्या ब्राउझरच्या साइट सेटिंग्जमध्ये स्थानाला परवानगी द्या आणि पुन्हा प्रयत्न करा.'
  },
  navUnavailableMsg: {
    en: "Couldn't determine your location — this usually means your OS location service is off, not an app problem. Pick your sector manually for now.",
    hi: 'आपका स्थान निर्धारित नहीं हो सका — इसका आमतौर पर मतलब है कि आपके OS की लोकेशन सेवा बंद है, यह ऐप की समस्या नहीं है. अभी के लिए अपना सेक्टर मैन्युअल रूप से चुनें.',
    mr: 'तुमचे स्थान निश्चित करता आले नाही — सहसा याचा अर्थ तुमच्या OS ची लोकेशन सेवा बंद आहे, अ‍ॅपची समस्या नाही. सध्या तुमचा विभाग मॅन्युअली निवडा.'
  },
  navTimeoutMsg: {
    en: 'Location request timed out — pick your sector manually, or try again.',
    hi: 'स्थान अनुरोध समय सीमा समाप्त — अपना सेक्टर मैन्युअल रूप से चुनें, या पुनः प्रयास करें.',
    mr: 'स्थान विनंतीची वेळ संपली — तुमचा विभाग मॅन्युअली निवडा, किंवा पुन्हा प्रयत्न करा.'
  },
  navInsecureMsg: {
    en: 'This page needs HTTPS for location to work — pick your sector manually.',
    hi: 'स्थान काम करने के लिए इस पेज को HTTPS की आवश्यकता है — अपना सेक्टर मैन्युअल रूप से चुनें.',
    mr: 'स्थान कार्य करण्यासाठी या पानाला HTTPS आवश्यक आहे — तुमचा विभाग मॅन्युअली निवडा.'
  },
  navNoFacilities: { en: 'No matching facilities found for this category.', hi: 'इस श्रेणी के लिए कोई मेल खाती सुविधा नहीं मिली.', mr: 'या प्रकारासाठी जुळणारी सुविधा सापडली नाही.' },
  navMinWalk: { en: 'min walk', hi: 'मिनट पैदल', mr: 'मिनिटे चालत' },
  routeFastest: { en: 'Fastest', hi: 'सबसे तेज़', mr: 'सर्वात जलद' },
  routeSafest: { en: 'Safest', hi: 'सबसे सुरक्षित', mr: 'सर्वात सुरक्षित' },
  routeLowestCrowd: { en: 'Lowest Crowd', hi: 'सबसे कम भीड़', mr: 'सर्वात कमी गर्दी' },
  catMedicalFacility: { en: 'Medical facility', hi: 'चिकित्सा सुविधा', mr: 'वैद्यकीय सुविधा' },
  catToilet: { en: 'Toilet', hi: 'शौचालय', mr: 'शौचालय' },
  catWaterPoint: { en: 'Water point', hi: 'जल केंद्र', mr: 'पाणी केंद्र' },
  catParking: { en: 'Parking', hi: 'पार्किंग', mr: 'पार्किंग' },
  catPolicePost: { en: 'Police post', hi: 'पुलिस चौकी', mr: 'पोलीस चौकी' },
  catFirePost: { en: 'Fire post', hi: 'अग्निशमन चौकी', mr: 'अग्निशमन चौकी' },
  catGhat: { en: 'Ghat', hi: 'घाट', mr: 'घाट' },
  catBridge: { en: 'Bridge', hi: 'पुल', mr: 'पूल' },

  wbReadyTitle: { en: 'Wristband ready', hi: 'पट्टी तैयार है', mr: 'पट्टी तयार आहे' },
  wbReadySubtitle: {
    en: "Print it now, or screenshot this screen if there's no printer nearby — either way, the QR still scans.",
    hi: 'इसे अभी प्रिंट करें, या अगर पास में प्रिंटर नहीं है तो इस स्क्रीन का स्क्रीनशॉट लें — दोनों ही तरीकों से क्यूआर स्कैन होगा.',
    mr: 'आत्ता प्रिंट करा, किंवा जवळ प्रिंटर नसल्यास या स्क्रीनचा स्क्रीनशॉट घ्या — दोन्ही प्रकारे क्यूआर स्कॅन होईल.'
  },
  wbMakeAnother: { en: 'Make another wristband', hi: 'एक और पट्टी बनाएं', mr: 'आणखी एक पट्टी बनवा' },
  wbPrivacyNote: {
    en: "Only the name, age, guardian contact, and anything you write in medical notes are stored — no photo, no address, no facial data. This is intentionally visible to whoever scans the code, since that's the whole point: fast reunification, not a private record.",
    hi: 'केवल नाम, उम्र, अभिभावक संपर्क, और आप मेडिकल नोट्स में जो कुछ भी लिखें वह संग्रहीत होता है — कोई फोटो नहीं, कोई पता नहीं, कोई चेहरे का डेटा नहीं. यह जानबूझकर उस किसी को भी दिखाई देता है जो कोड स्कैन करता है, क्योंकि यही पूरा उद्देश्य है: तेज़ पुनर्मिलन, निजी रिकॉर्ड नहीं.',
    mr: 'फक्त नाव, वय, पालकांचा संपर्क, आणि तुम्ही वैद्यकीय नोंदींमध्ये जे काही लिहाल तेच साठवले जाते — फोटो नाही, पत्ता नाही, चेहऱ्याचा डेटा नाही. कोड स्कॅन करणाऱ्या कोणालाही हे मुद्दाम दिसते, कारण हाच संपूर्ण उद्देश आहे: जलद पुनर्मिलन, खाजगी नोंद नाही.'
  },
  wbFullNamePlaceholder: { en: 'Who is wearing this band', hi: 'यह पट्टी कौन पहन रहा है', mr: 'ही पट्टी कोण घालत आहे' },
  wbGuardianName: { en: 'Your name (guardian)', hi: 'आपका नाम (अभिभावक)', mr: 'तुमचे नाव (पालक)' },
  wbGuardianPhone: { en: 'Your phone number', hi: 'आपका फोन नंबर', mr: 'तुमचा फोन नंबर' },
  wbGuardianPhonePlaceholder: { en: 'Whoever finds them will call this', hi: 'जो कोई उन्हें पाएगा वह इस पर कॉल करेगा', mr: 'जो कोणी त्यांना शोधेल तो यावर कॉल करेल' },
  wbMeetingPoint: { en: 'Meeting point (optional)', hi: 'मिलने का स्थान (वैकल्पिक)', mr: 'भेटीचे ठिकाण (ऐच्छिक)' },
  wbNoMeetingPoint: { en: 'No fixed meeting point', hi: 'कोई निश्चित मिलन स्थान नहीं', mr: 'निश्चित भेटीचे ठिकाण नाही' },
  wbMedicalNotes: { en: 'Medical notes (optional)', hi: 'चिकित्सा नोट्स (वैकल्पिक)', mr: 'वैद्यकीय नोंदी (ऐच्छिक)' },
  wbMedicalNotesPlaceholder: {
    en: 'Allergies, conditions, medication — anything a helper should know immediately',
    hi: 'एलर्जी, स्थितियां, दवाएं — कुछ भी जो मदद करने वाले को तुरंत पता होना चाहिए',
    mr: 'अ‍ॅलर्जी, स्थिती, औषधे — मदत करणाऱ्याला लगेच माहित असणे आवश्यक असलेली कोणतीही गोष्ट'
  },
  wbCreating: { en: 'Creating…', hi: 'बनाया जा रहा है…', mr: 'तयार करत आहे…' },
  wbCreateButton: { en: 'Create wristband', hi: 'पट्टी बनाएं', mr: 'पट्टी तयार करा' },
  wbCreateError: { en: 'Could not create the wristband. Please try again.', hi: 'पट्टी नहीं बन सकी. कृपया पुनः प्रयास करें.', mr: 'पट्टी तयार करता आली नाही. कृपया पुन्हा प्रयत्न करा.' },

  wbNotFound: {
    en: 'No wristband found with that code — it may have expired or been mistyped.',
    hi: 'उस कोड से कोई पट्टी नहीं मिली — यह समाप्त हो गई हो सकती है या गलत टाइप हुई हो सकती है.',
    mr: 'त्या कोडने कोणतीही पट्टी सापडली नाही — ती कालबाह्य झाली असेल किंवा चुकीची टाइप झाली असेल.'
  },
  wbFoundThisPerson: { en: 'Found this person?', hi: 'यह व्यक्ति मिला?', mr: 'ही व्यक्ती सापडली?' },
  wbAge: { en: 'Age', hi: 'आयु', mr: 'वय' },
  wbMarkedStatus: {
    en: 'This wristband is marked {status} — the guardian below may no longer be nearby, but the number still works.',
    hi: 'यह पट्टी {status} के रूप में चिह्नित है — नीचे दिया गया अभिभावक अब आसपास न हो, लेकिन नंबर अभी भी काम करता है.',
    mr: 'ही पट्टी {status} म्हणून चिन्हांकित आहे — खालील पालक आता जवळ नसतील, पण नंबर अजूनही कार्यरत आहे.'
  },
  wbCall: { en: 'Call', hi: 'कॉल करें', mr: 'कॉल करा' },
  wbMeetingPointLabel: { en: 'Meeting point', hi: 'मिलने का स्थान', mr: 'भेटीचे ठिकाण' },
  wbCantReach: { en: "Can't reach the guardian? Take them to the nearest volunteer or Command Centre post, or", hi: 'अभिभावक तक नहीं पहुंच पा रहे? उन्हें निकटतम स्वयंसेवक या कमांड सेंटर पोस्ट पर ले जाएं, या', mr: 'पालकांशी संपर्क होत नाही? त्यांना जवळच्या स्वयंसेवक किंवा कमांड सेंटर पोस्टवर घेऊन जा, किंवा' },
  wbFileReport: { en: 'file a Lost & Found report', hi: 'खोया-पाया रिपोर्ट दर्ज करें', mr: 'हरवले-सापडले अहवाल नोंदवा' },

  emgPrototypeStrong: { en: 'This is a prototype.', hi: 'यह एक प्रोटोटाइप है.', mr: 'हा एक प्रोटोटाइप आहे.' },
  emgPrototypeBody: {
    en: 'KumbhOS is not connected to real emergency services (police, ambulance, fire, 112). In a genuine emergency, contact local authorities directly. This page demonstrates how an operational emergency-response layer would surface information to the public.',
    hi: 'KumbhOS वास्तविक आपातकालीन सेवाओं (पुलिस, एम्बुलेंस, अग्निशमन, 112) से जुड़ा नहीं है. वास्तविक आपातकाल में, सीधे स्थानीय अधिकारियों से संपर्क करें. यह पेज दिखाता है कि एक परिचालन आपातकालीन-प्रतिक्रिया स्तर जनता को जानकारी कैसे दिखाएगा.',
    mr: 'KumbhOS खऱ्या आणीबाणी सेवांशी (पोलीस, रुग्णवाहिका, अग्निशमन, 112) जोडलेले नाही. खऱ्या आणीबाणीत, थेट स्थानिक अधिकाऱ्यांशी संपर्क साधा. हे पान एक कार्यरत आणीबाणी-प्रतिसाद स्तर जनतेला माहिती कशी दाखवेल हे दाखवते.'
  },
  emgNearestFacilities: { en: 'Nearest facilities (from Sangam Nose)', hi: 'निकटतम सुविधाएं (संगम नोज से)', mr: 'जवळच्या सुविधा (संगम नोज पासून)' },
  emgNearestMedical: { en: 'Nearest medical facility', hi: 'निकटतम चिकित्सा सुविधा', mr: 'जवळची वैद्यकीय सुविधा' },
  emgNearestPolice: { en: 'Nearest police post', hi: 'निकटतम पुलिस चौकी', mr: 'जवळची पोलीस चौकी' },
  emgNearestFire: { en: 'Nearest fire post', hi: 'निकटतम अग्निशमन चौकी', mr: 'जवळची अग्निशमन चौकी' },
  emgAway: { en: 'away', hi: 'दूर', mr: 'दूर' },
  emgNoFacilityData: { en: 'No facility data available.', hi: 'कोई सुविधा डेटा उपलब्ध नहीं है.', mr: 'सुविधा डेटा उपलब्ध नाही.' },
  emgHowHandled: { en: 'How KumbhOS handles incidents', hi: 'KumbhOS घटनाओं को कैसे संभालता है', mr: 'KumbhOS घटना कशा हाताळते' },
  emgStep1: {
    en: 'An incident is reported (by staff, volunteers, or sensors) with type, severity and location.',
    hi: 'एक घटना की रिपोर्ट (स्टाफ, स्वयंसेवकों, या सेंसर द्वारा) प्रकार, गंभीरता और स्थान के साथ की जाती है.',
    mr: 'एक घटना (कर्मचारी, स्वयंसेवक किंवा सेन्सरद्वारे) प्रकार, तीव्रता आणि स्थानासह नोंदवली जाते.'
  },
  emgStep2: {
    en: 'The command centre reviews the automatically-generated dispatch recommendation.',
    hi: 'कमांड सेंटर स्वचालित रूप से उत्पन्न भेजने की सिफारिश की समीक्षा करता है.',
    mr: 'कमांड सेंटर आपोआप तयार झालेल्या पाठवण्याच्या शिफारशीचे पुनरावलोकन करते.'
  },
  emgStep3: {
    en: 'A human operator confirms dispatch — KumbhOS never auto-dispatches real responders.',
    hi: 'एक मानव संचालक भेजने की पुष्टि करता है — KumbhOS कभी भी वास्तविक प्रतिक्रियाकर्ताओं को स्वतः नहीं भेजता.',
    mr: 'एक मानवी ऑपरेटर पाठवण्याची पुष्टी करतो — KumbhOS कधीही खऱ्या प्रतिसादकर्त्यांना आपोआप पाठवत नाही.'
  },
  emgStep4: {
    en: 'Status is tracked through Acknowledged → Dispatched → Responding → Resolved.',
    hi: 'स्थिति को स्वीकृत → भेजा गया → प्रतिक्रिया दे रहे हैं → हल हो गया के माध्यम से ट्रैक किया जाता है.',
    mr: 'स्थिती मान्य केले → पाठवले → प्रतिसाद देत आहे → निकाली लागले याद्वारे ट्रॅक केली जाते.'
  },

  wqPageTitle: { en: 'Ganga Water Quality', hi: 'गंगा जल गुणवत्ता', mr: 'गंगा पाणी गुणवत्ता' },
  wqPageSubtitle: {
    en: 'Publicly reported bathing-water figures from past Kumbh gatherings, compared against the official CPCB standard.',
    hi: 'पिछले कुंभ मेलों से सार्वजनिक रूप से रिपोर्ट किए गए स्नान-जल के आंकड़े, आधिकारिक CPCB मानक की तुलना में.',
    mr: 'मागील कुंभ मेळाव्यांमधून सार्वजनिकरित्या नोंदवलेले स्नान-पाण्याचे आकडे, अधिकृत CPCB मानकाशी तुलना केलेले.'
  },
  wqOfficialStandard: { en: 'Official reference standard', hi: 'आधिकारिक संदर्भ मानक', mr: 'अधिकृत संदर्भ मानक' },
  wqDissolvedOxygen: { en: 'Dissolved oxygen', hi: 'घुलित ऑक्सीजन', mr: 'विरघळलेला ऑक्सिजन' },
  wqFecalColiform: { en: 'Fecal coliform', hi: 'फेकल कोलिफॉर्म', mr: 'फेकल कोलिफॉर्म' },
  wqDesirableMax: { en: 'desirable / {max} max', hi: 'वांछनीय / {max} अधिकतम', mr: 'इष्ट / {max} कमाल' },
  wqPrecautionTitle: { en: 'General precaution, not medical advice', hi: 'सामान्य सावधानी, चिकित्सा सलाह नहीं', mr: 'सर्वसाधारण खबरदारी, वैद्यकीय सल्ला नाही' },
  wqPrecautionBody: {
    en: 'Fecal coliform above safe-bathing limits raises the chance of gastrointestinal or skin infection from prolonged contact or swallowing water — this is a general public-health precaution, elevated further for infants, people with open wounds, or weakened immune systems. It is not a diagnosis or a substitute for official on-the-ground advisories, which can change day to day. Risk levels below are derived by comparing the reported figures against the CPCB standard above, not an independent lab result.',
    hi: 'सुरक्षित-स्नान सीमा से अधिक फेकल कोलिफॉर्म लंबे समय तक संपर्क या पानी निगलने से जठरांत्र या त्वचा संक्रमण की संभावना बढ़ाता है — यह एक सामान्य सार्वजनिक स्वास्थ्य सावधानी है, जो शिशुओं, खुले घाव वाले लोगों, या कमजोर प्रतिरक्षा प्रणाली वालों के लिए और अधिक बढ़ जाती है. यह कोई निदान या आधिकारिक जमीनी सलाह का विकल्प नहीं है, जो दिन-प्रतिदिन बदल सकती है. नीचे दिए गए जोखिम स्तर रिपोर्ट किए गए आंकड़ों की ऊपर दिए गए CPCB मानक से तुलना करके निकाले गए हैं, न कि किसी स्वतंत्र प्रयोगशाला परिणाम से.',
    mr: 'सुरक्षित-स्नान मर्यादेपेक्षा जास्त फेकल कोलिफॉर्ममुळे दीर्घकाळ संपर्कात राहिल्याने किंवा पाणी गिळल्याने जठरांत्रीय किंवा त्वचा संसर्गाची शक्यता वाढते — ही एक सर्वसाधारण सार्वजनिक आरोग्य खबरदारी आहे, जी लहान मुले, उघड्या जखमा असलेले लोक, किंवा कमकुवत रोगप्रतिकारशक्ती असलेल्यांसाठी अधिक वाढते. हे निदान नाही किंवा अधिकृत प्रत्यक्ष सल्ल्याचा पर्याय नाही, जो दिवसागणिक बदलू शकतो. खालील धोका पातळी नोंदवलेल्या आकड्यांची वरील CPCB मानकाशी तुलना करून काढलेली आहे, स्वतंत्र प्रयोगशाळा निकाल नाही.'
  },
  wqNoRecords: { en: 'No water quality records yet.', hi: 'अभी तक कोई जल गुणवत्ता रिकॉर्ड नहीं है.', mr: 'अजून पाणी गुणवत्तेची नोंद नाही.' },
  wqLastUpdated: { en: 'Last updated', hi: 'अंतिम अद्यतन', mr: 'शेवटचे अद्यतन' },

  chatTryAsking: { en: 'Try asking:', hi: 'पूछकर देखें:', mr: 'विचारून पहा:' },
  chatThinking: { en: 'Thinking…', hi: 'सोच रहा है…', mr: 'विचार करत आहे…' },
  chatGroundedAnswer: { en: 'grounded answer · no AI backend configured', hi: 'आधारित उत्तर · कोई AI बैकएंड कॉन्फ़िगर नहीं', mr: 'आधारित उत्तर · कोणतेही AI बॅकएंड कॉन्फिगर केलेले नाही' },
  chatUnavailable: { en: 'The assistant is temporarily unavailable.', hi: 'सहायक अस्थायी रूप से अनुपलब्ध है.', mr: 'सहाय्यक तात्पुरते अनुपलब्ध आहे.' },
  chatRetry: { en: 'Retry', hi: 'पुनः प्रयास करें', mr: 'पुन्हा प्रयत्न करा' },
  chatPlaceholder: { en: 'Ask about facilities, crowd conditions, routes…', hi: 'सुविधाओं, भीड़ की स्थिति, मार्गों के बारे में पूछें…', mr: 'सुविधा, गर्दीची स्थिती, मार्ग याबद्दल विचारा…' },
  chatSend: { en: 'Send', hi: 'भेजें', mr: 'पाठवा' },
  chatSuggestion1: { en: 'Where is the nearest toilet?', hi: 'निकटतम शौचालय कहां है?', mr: 'जवळचे शौचालय कुठे आहे?' },
  chatSuggestion2: { en: 'Which sector currently has the lowest crowd pressure?', hi: 'अभी किस सेक्टर में सबसे कम भीड़ दबाव है?', mr: 'सध्या कोणत्या विभागात सर्वात कमी गर्दी दाब आहे?' },
  chatSuggestion3: { en: 'Where is the nearest medical facility?', hi: 'निकटतम चिकित्सा सुविधा कहां है?', mr: 'जवळची वैद्यकीय सुविधा कुठे आहे?' },
  chatSuggestion4: { en: 'My grandmother is walking slowly, which route should we take?', hi: 'मेरी दादी धीरे चल रही हैं, हमें कौन सा रास्ता लेना चाहिए?', mr: 'माझी आजी हळू चालत आहे, आम्ही कोणता मार्ग घ्यावा?' },
  chatSuggestion5: { en: 'What events are happening today?', hi: 'आज कौन से कार्यक्रम हो रहे हैं?', mr: 'आज कोणते कार्यक्रम होत आहेत?' },

  emptyNoData: { en: 'No data to show yet.', hi: 'अभी दिखाने के लिए कोई डेटा नहीं है.', mr: 'अजून दाखवण्यासाठी डेटा नाही.' },
  loading: { en: 'Loading…', hi: 'लोड हो रहा है…', mr: 'लोड होत आहे…' },
  retry: { en: 'Retry', hi: 'पुनः प्रयास करें', mr: 'पुन्हा प्रयत्न करा' }
} satisfies Record<string, Record<Lang, string>>;

export type DictionaryKey = keyof typeof dictionary;
