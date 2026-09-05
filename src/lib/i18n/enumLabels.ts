// Centralized Hindi/Marathi/English labels for every domain enum rendered
// as a badge/pill/status label anywhere in the app. Before this file
// existed, most of these were rendered via titleCase() on the raw enum
// constant (e.g. MISSING_PERSON -> "Missing Person") with no translation
// hook at all — see the i18n survey referenced in the trilingual rollout
// commit. Component-local UI state (e.g. SosModal's ShareState) is
// translated inline in that component instead, since it isn't a shared
// domain type.
import type { Lang } from './dictionary';
import type {
  AssetCategory,
  AssetStatus,
  BathingStandardVerdict,
  DataSource,
  DataSourceRecord,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  LostFoundCaseType,
  LostFoundStatus,
  ResponderRole,
  RiskLevel,
  Role,
  ScenarioType,
  ToiletStatus,
  WaterQualityRiskLevel,
  WristbandStatus
} from '@/lib/data/types';
import type { SanitationPressure } from '@/lib/data/types';

type LabelMap<T extends string> = Record<T, Record<Lang, string>>;

export function tEnum<T extends string>(map: LabelMap<T>, value: T, lang: Lang): string {
  return map[value]?.[lang] ?? value;
}

export const riskLevelLabels: LabelMap<RiskLevel> = {
  NORMAL: { en: 'Normal', hi: 'सामान्य', mr: 'सामान्य' },
  BUILDING: { en: 'Building', hi: 'बढ़ रहा है', mr: 'वाढत आहे' },
  CRITICAL: { en: 'Critical', hi: 'गंभीर', mr: 'गंभीर' },
  INTERVENTION: { en: 'Intervention Required', hi: 'हस्तक्षेप आवश्यक', mr: 'हस्तक्षेप आवश्यक' }
};

export const waterQualityRiskLabels: LabelMap<WaterQualityRiskLevel> = {
  LOW: { en: 'Low', hi: 'कम', mr: 'कमी' },
  MODERATE: { en: 'Moderate', hi: 'मध्यम', mr: 'मध्यम' },
  HIGH: { en: 'High', hi: 'उच्च', mr: 'उच्च' },
  DISPUTED: { en: 'Disputed', hi: 'विवादित', mr: 'वादग्रस्त' }
};

export const bathingStandardVerdictLabels: LabelMap<BathingStandardVerdict> = {
  MEETS_STANDARD: { en: 'Meets bathing standard', hi: 'स्नान मानक पूरा करता है', mr: 'स्नान मानक पूर्ण करते' },
  EXCEEDS_STANDARD: { en: 'Exceeds bathing standard', hi: 'स्नान मानक से अधिक है', mr: 'स्नान मानकापेक्षा जास्त' },
  PARTIAL: { en: 'Partially meets standard', hi: 'आंशिक रूप से मानक पूरा करता है', mr: 'अंशतः मानक पूर्ण करते' },
  DISPUTED: { en: 'Disputed / conflicting reports', hi: 'विवादित / परस्पर विरोधी रिपोर्ट', mr: 'वादग्रस्त / परस्परविरोधी अहवाल' }
};

export const wristbandStatusLabels: LabelMap<WristbandStatus> = {
  ACTIVE: { en: 'Active', hi: 'सक्रिय', mr: 'सक्रिय' },
  REUNITED: { en: 'Reunited', hi: 'पुनर्मिलित', mr: 'पुनर्मिलन झाले' },
  EXPIRED: { en: 'Expired', hi: 'समाप्त', mr: 'कालबाह्य' }
};

export const assetStatusLabels: LabelMap<AssetStatus> = {
  OPERATIONAL: { en: 'Operational', hi: 'चालू', mr: 'कार्यरत' },
  DEGRADED: { en: 'Degraded', hi: 'क्षीण', mr: 'क्षीण' },
  CRITICAL: { en: 'Critical', hi: 'गंभीर', mr: 'गंभीर' },
  OFFLINE: { en: 'Offline', hi: 'बंद', mr: 'बंद' }
};

export const assetCategoryLabels: LabelMap<AssetCategory> = {
  TOILET: { en: 'Toilet', hi: 'शौचालय', mr: 'शौचालय' },
  WATER_POINT: { en: 'Water Point', hi: 'जल केंद्र', mr: 'पाणी केंद्र' },
  ROAD: { en: 'Road', hi: 'सड़क', mr: 'रस्ता' },
  BRIDGE: { en: 'Bridge', hi: 'पुल', mr: 'पूल' },
  GHAT: { en: 'Ghat', hi: 'घाट', mr: 'घाट' },
  LIGHTING: { en: 'Lighting', hi: 'प्रकाश व्यवस्था', mr: 'प्रकाश व्यवस्था' },
  MEDICAL: { en: 'Medical', hi: 'चिकित्सा', mr: 'वैद्यकीय' },
  POLICE: { en: 'Police', hi: 'पुलिस', mr: 'पोलीस' },
  FIRE: { en: 'Fire', hi: 'अग्निशमन', mr: 'अग्निशमन' },
  PARKING: { en: 'Parking', hi: 'पार्किंग', mr: 'पार्किंग' },
  WASTE_BIN: { en: 'Waste Bin', hi: 'कचरा पात्र', mr: 'कचरा पेटी' },
  INFO_DISPLAY: { en: 'Info Display', hi: 'सूचना प्रदर्शन', mr: 'माहिती फलक' }
};

export const dataSourceTypeLabels: LabelMap<DataSource> = {
  SIMULATED: { en: 'Simulated', hi: 'सिम्युलेटेड', mr: 'सिम्युलेटेड' },
  LIVE: { en: 'Live', hi: 'लाइव', mr: 'लाइव्ह' },
  GOVERNMENT_OPEN_DATA: { en: 'Government Open Data', hi: 'सरकारी खुला डेटा', mr: 'सरकारी खुला डेटा' },
  DERIVED: { en: 'Derived', hi: 'व्युत्पन्न', mr: 'व्युत्पन्न' },
  USER_REPORTED: { en: 'User Reported', hi: 'उपयोगकर्ता द्वारा रिपोर्ट किया गया', mr: 'वापरकर्त्याने नोंदवलेले' }
};

export const dataSourceStatusLabels: LabelMap<DataSourceRecord['status']> = {
  ACTIVE: { en: 'Active', hi: 'सक्रिय', mr: 'सक्रिय' },
  STUBBED: { en: 'Stubbed', hi: 'अस्थायी', mr: 'तात्पुरते' },
  PLANNED: { en: 'Planned', hi: 'नियोजित', mr: 'नियोजित' }
};

export const lostFoundCaseTypeLabels: LabelMap<LostFoundCaseType> = {
  LOST_PERSON: { en: 'Lost Person', hi: 'लापता व्यक्ति', mr: 'हरवलेली व्यक्ती' },
  FOUND_PERSON: { en: 'Found Person', hi: 'मिला व्यक्ति', mr: 'सापडलेली व्यक्ती' },
  LOST_ITEM: { en: 'Lost Item', hi: 'खोई हुई वस्तु', mr: 'हरवलेली वस्तू' },
  FOUND_ITEM: { en: 'Found Item', hi: 'मिली हुई वस्तु', mr: 'सापडलेली वस्तू' }
};

export const lostFoundStatusLabels: LabelMap<LostFoundStatus> = {
  OPEN: { en: 'Open', hi: 'खुला', mr: 'खुले' },
  POTENTIAL_MATCH: { en: 'Potential Match', hi: 'संभावित मिलान', mr: 'संभाव्य जुळणी' },
  VERIFIED: { en: 'Verified', hi: 'सत्यापित', mr: 'पडताळणी झाली' },
  REUNITED: { en: 'Reunited', hi: 'पुनर्मिलित', mr: 'पुनर्मिलन झाले' },
  CLOSED: { en: 'Closed', hi: 'बंद', mr: 'बंद' }
};

export const incidentTypeLabels: LabelMap<IncidentType> = {
  MEDICAL: { en: 'Medical', hi: 'चिकित्सा', mr: 'वैद्यकीय' },
  FIRE: { en: 'Fire', hi: 'आग', mr: 'आग' },
  MISSING_PERSON: { en: 'Missing Person', hi: 'लापता व्यक्ति', mr: 'हरवलेली व्यक्ती' },
  CROWD_SURGE: { en: 'Crowd Surge', hi: 'भीड़ का दबाव', mr: 'गर्दीचा उद्रेक' },
  ACCIDENT: { en: 'Accident', hi: 'दुर्घटना', mr: 'अपघात' },
  INFRASTRUCTURE_FAILURE: { en: 'Infrastructure Failure', hi: 'अवसंरचना विफलता', mr: 'पायाभूत सुविधा बिघाड' },
  WATER_FLOOD: { en: 'Water / Flood', hi: 'जल / बाढ़', mr: 'पाणी / पूर' },
  SECURITY: { en: 'Security', hi: 'सुरक्षा', mr: 'सुरक्षा' },
  OTHER: { en: 'Other', hi: 'अन्य', mr: 'इतर' }
};

export const incidentSeverityLabels: LabelMap<IncidentSeverity> = {
  LOW: { en: 'Low', hi: 'कम', mr: 'कमी' },
  MODERATE: { en: 'Moderate', hi: 'मध्यम', mr: 'मध्यम' },
  HIGH: { en: 'High', hi: 'उच्च', mr: 'उच्च' },
  CRITICAL: { en: 'Critical', hi: 'गंभीर', mr: 'गंभीर' }
};

export const incidentStatusLabels: LabelMap<IncidentStatus> = {
  NEW: { en: 'New', hi: 'नया', mr: 'नवीन' },
  ACKNOWLEDGED: { en: 'Acknowledged', hi: 'स्वीकृत', mr: 'मान्य केले' },
  DISPATCHED: { en: 'Dispatched', hi: 'भेजा गया', mr: 'पाठवले' },
  RESPONDING: { en: 'Responding', hi: 'प्रतिक्रिया दे रहे हैं', mr: 'प्रतिसाद देत आहे' },
  RESOLVED: { en: 'Resolved', hi: 'हल हो गया', mr: 'निकाली लागले' }
};

export const sanitationPressureLabels: LabelMap<SanitationPressure['pressure']> = {
  NORMAL: { en: 'Normal', hi: 'सामान्य', mr: 'सामान्य' },
  WATCH: { en: 'Watch', hi: 'निगरानी', mr: 'निरीक्षण' },
  HIGH: { en: 'High', hi: 'उच्च', mr: 'उच्च' },
  CRITICAL: { en: 'Critical', hi: 'गंभीर', mr: 'गंभीर' }
};

export const toiletStatusLabels: LabelMap<ToiletStatus> = {
  AVAILABLE: { en: 'Available', hi: 'उपलब्ध', mr: 'उपलब्ध' },
  BUSY: { en: 'Busy', hi: 'व्यस्त', mr: 'व्यस्त' },
  NEEDS_CLEANING: { en: 'Needs Cleaning', hi: 'सफाई की आवश्यकता', mr: 'स्वच्छतेची गरज' },
  OUT_OF_SERVICE: { en: 'Out of Service', hi: 'सेवा से बाहर', mr: 'सेवेबाहेर' },
  UNKNOWN: { en: 'Unknown', hi: 'अज्ञात', mr: 'अज्ञात' }
};

export const scenarioTypeLabels: LabelMap<ScenarioType> = {
  CROWD_INFLUX: { en: 'Sudden crowd influx', hi: 'अचानक भीड़ की आमद', mr: 'अचानक गर्दीचा ओघ' },
  CROWD_DECREASE: { en: 'Crowd decrease', hi: 'भीड़ में कमी', mr: 'गर्दीत घट' },
  BRIDGE_CLOSURE: { en: 'Bridge closure', hi: 'पुल बंद', mr: 'पूल बंद' },
  ROAD_CLOSURE: { en: 'Road closure', hi: 'सड़क बंद', mr: 'रस्ता बंद' },
  GHAT_CLOSURE: { en: 'Ghat closure', hi: 'घाट बंद', mr: 'घाट बंद' },
  TRAIN_ARRIVAL: { en: 'Train arrival', hi: 'ट्रेन का आगमन', mr: 'रेल्वे आगमन' },
  PARKING_OVERFLOW: { en: 'Parking overflow', hi: 'पार्किंग ओवरफ्लो', mr: 'पार्किंग ओव्हरफ्लो' },
  TOILET_OVERLOAD: { en: 'Toilet overload', hi: 'शौचालय पर अत्यधिक दबाव', mr: 'शौचालयावर अतिभार' },
  WATER_FAILURE: { en: 'Water supply failure', hi: 'जल आपूर्ति विफलता', mr: 'पाणीपुरवठा बिघाड' },
  MEDICAL_EMERGENCY: { en: 'Medical emergency', hi: 'चिकित्सा आपातकाल', mr: 'वैद्यकीय आणीबाणी' },
  FIRE_INCIDENT: { en: 'Fire incident', hi: 'आग की घटना', mr: 'आगीची घटना' },
  WEATHER_DISRUPTION: { en: 'Weather disruption', hi: 'मौसम व्यवधान', mr: 'हवामान व्यत्यय' },
  EVENT_COMPLETION: { en: 'Event completion', hi: 'कार्यक्रम समाप्ति', mr: 'कार्यक्रम समाप्ती' }
};

export const roleLabels: LabelMap<Role> = {
  SUPER_ADMIN: { en: 'Super Admin', hi: 'सुपर एडमिन', mr: 'सुपर अ‍ॅडमिन' },
  COMMAND_CENTER: { en: 'Command Centre', hi: 'कमांड सेंटर', mr: 'कमांड सेंटर' },
  POLICE: { en: 'Police', hi: 'पुलिस', mr: 'पोलीस' },
  MEDICAL: { en: 'Medical', hi: 'चिकित्सा', mr: 'वैद्यकीय' },
  FIRE: { en: 'Fire', hi: 'अग्निशमन', mr: 'अग्निशमन' },
  SANITATION: { en: 'Sanitation', hi: 'स्वच्छता', mr: 'स्वच्छता' },
  VOLUNTEER: { en: 'Volunteer', hi: 'स्वयंसेवक', mr: 'स्वयंसेवक' },
  VIEW_ONLY: { en: 'View Only', hi: 'केवल देखें', mr: 'फक्त पहा' }
};

export const responderRoleLabels: LabelMap<ResponderRole> = {
  MEDICAL: { en: 'Medical', hi: 'चिकित्सा', mr: 'वैद्यकीय' },
  POLICE: { en: 'Police', hi: 'पुलिस', mr: 'पोलीस' },
  FIRE: { en: 'Fire', hi: 'अग्निशमन', mr: 'अग्निशमन' },
  SANITATION: { en: 'Sanitation', hi: 'स्वच्छता', mr: 'स्वच्छता' }
};
