// Indicative fair-price ranges for common everyday purchases in Nashik, aimed
// at outstation pilgrims who don't know local rates and are vulnerable to
// being overcharged. These are typical seasonal retail ranges compiled as
// editorial reference content — NOT a live price feed (Nashik has no public
// live mandi/retail price API we can wire up honestly), and are clearly
// labelled as such in the UI. Update seasonally if this ships for real use.
export type PriceCategory = 'vegetables' | 'fruits' | 'essentials' | 'transport' | 'food';

export interface PriceEntry {
  id: string;
  item: string;
  category: PriceCategory;
  unit: string;
  typicalMin: number;
  typicalMax: number;
  note?: string;
}

export const PRICE_CATEGORY_LABELS: Record<PriceCategory, string> = {
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  essentials: 'Daily Essentials',
  transport: 'Local Transport',
  food: 'Street Food & Meals'
};

export const NASHIK_PRICE_GUIDE: PriceEntry[] = [
  { id: 'tomato', item: 'Tomato', category: 'vegetables', unit: 'per kg', typicalMin: 20, typicalMax: 40 },
  { id: 'onion', item: 'Onion', category: 'vegetables', unit: 'per kg', typicalMin: 20, typicalMax: 35 },
  { id: 'potato', item: 'Potato', category: 'vegetables', unit: 'per kg', typicalMin: 15, typicalMax: 30 },
  { id: 'green-chilli', item: 'Green Chilli', category: 'vegetables', unit: 'per kg', typicalMin: 30, typicalMax: 60 },
  { id: 'coriander', item: 'Coriander (bunch)', category: 'vegetables', unit: 'per bunch', typicalMin: 5, typicalMax: 15 },
  { id: 'banana', item: 'Banana', category: 'fruits', unit: 'per dozen', typicalMin: 30, typicalMax: 60 },
  { id: 'grapes', item: 'Grapes (Nashik is grape country)', category: 'fruits', unit: 'per kg', typicalMin: 40, typicalMax: 90 },
  { id: 'pomegranate', item: 'Pomegranate', category: 'fruits', unit: 'per kg', typicalMin: 80, typicalMax: 150 },
  { id: 'water-bottle', item: 'Packaged Water Bottle (1L)', category: 'essentials', unit: 'per bottle', typicalMin: 15, typicalMax: 20, note: 'MRP printed on bottle — never pay above it' },
  { id: 'tea', item: 'Cutting Chai', category: 'food', unit: 'per cup', typicalMin: 8, typicalMax: 15 },
  { id: 'misal-pav', item: 'Misal Pav (local specialty)', category: 'food', unit: 'per plate', typicalMin: 40, typicalMax: 80 },
  { id: 'thali', item: 'Basic Veg Thali', category: 'food', unit: 'per plate', typicalMin: 80, typicalMax: 150 },
  { id: 'auto-min', item: 'Auto-rickshaw Minimum Fare', category: 'transport', unit: 'flat/first 1.5 km', typicalMin: 25, typicalMax: 30, note: 'Insist on the meter, or agree on a price before the ride starts' },
  { id: 'auto-per-km', item: 'Auto-rickshaw', category: 'transport', unit: 'per additional km', typicalMin: 15, typicalMax: 18 }
];
