'use client';

import { useMemo, useRef, useState } from 'react';
import { Phone, Plus, X, ImagePlus } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { AsyncState } from '@/components/common/AsyncState';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { fetchJSON, FetchClientError } from '@/lib/http/fetchClient';
import { NASHIK_LANDMARKS } from '@/lib/data/nashikLandmarks';
import type { HomestayListing, HomestayType } from '@/lib/data/types';

const TYPES: HomestayType[] = ['HOMESTAY', 'GUESTHOUSE', 'DHARAMSHALA', 'HOTEL', 'PG'];
const TYPE_EMOJI: Record<HomestayType, string> = {
  HOMESTAY: '🏠',
  GUESTHOUSE: '🛏️',
  DHARAMSHALA: '🛕',
  HOTEL: '🏨',
  PG: '🛌'
};
const TYPE_LABEL: Record<HomestayType, string> = {
  HOMESTAY: 'Homestay',
  GUESTHOUSE: 'Guesthouse',
  DHARAMSHALA: 'Dharamshala',
  HOTEL: 'Hotel',
  PG: 'PG / Hostel'
};

const MAX_PHOTO_DIMENSION = 900;
const PHOTO_JPEG_QUALITY = 0.72;

// Resizes + re-encodes the chosen photo entirely on-device (canvas, no
// upload) before it's stored — keeps each listing's photo down to tens of
// KB rather than whatever multi-MB file a phone camera produces, which
// matters because this all lives in localStorage (see offlineStore.ts),
// not a real object-storage bucket.
function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file could not be read as an image.'));
      img.onload = () => {
        const scale = Math.min(1, MAX_PHOTO_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not process that image.'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', PHOTO_JPEG_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function HomestaysPage() {
  const api = useApi<HomestayListing[]>('/api/homestays');
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<HomestayType | 'ALL'>('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<HomestayType>('HOMESTAY');
  const [area, setArea] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [capacity, setCapacity] = useState('2');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [amenities, setAmenities] = useState('');
  const [description, setDescription] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const listings = useMemo(() => {
    const all = api.data ?? [];
    return filterType === 'ALL' ? all : all.filter((l) => l.type === filterType);
  }, [api.data, filterType]);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    try {
      setPhotoDataUrl(await resizeImageToDataUrl(file));
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Could not use that photo.');
    }
  }

  function resetForm() {
    setName('');
    setArea('');
    setPriceMin('');
    setPriceMax('');
    setCapacity('2');
    setContactName('');
    setContactPhone('');
    setAmenities('');
    setDescription('');
    setPhotoDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!photoDataUrl) {
      setPhotoError(t('homestayPhotoRequired'));
      return;
    }
    setSubmitState('submitting');
    setSubmitError(null);
    try {
      await fetchJSON('/api/homestays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          area,
          pricePerNightMin: Number(priceMin) || 0,
          pricePerNightMax: Number(priceMax) || 0,
          capacity: Number(capacity) || 1,
          contactName,
          contactPhone,
          amenities: amenities
            .split(',')
            .map((a) => a.trim())
            .filter(Boolean),
          description,
          photoDataUrl
        })
      });
      resetForm();
      setShowForm(false);
      setSubmitState('idle');
      api.retry();
    } catch (err) {
      setSubmitState('error');
      setSubmitError(err instanceof FetchClientError ? err.message : 'Could not save this listing.');
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading-serif text-3xl text-paper-text">{t('pageHomestaysTitle')}</h1>
          <p className="text-sm text-paper-muted">{t('pageHomestaysSubtitle')}</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="fast-transition flex items-center gap-1.5 rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? t('homestayCancelListing') : t('homestayListYours')}
        </button>
      </div>

      <p className="paper-card mb-4 p-3 text-xs text-paper-muted">📞 {t('homestayCallNote')}</p>

      {showForm && (
        <form onSubmit={handleSubmit} className="paper-card mb-6 space-y-3 p-4">
          <label className="block text-sm text-paper-muted">
            {t('homestayPhoto')} <span className="text-risk-critical">*</span>
            <div className="mt-1 flex items-center gap-3">
              {photoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoDataUrl} alt="Property preview" className="h-20 w-28 rounded-md border border-paper-border object-cover" />
              ) : (
                <div className="flex h-20 w-28 items-center justify-center rounded-md border border-dashed border-paper-border text-paper-faint">
                  <ImagePlus size={22} />
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="text-xs text-paper-muted" />
            </div>
            {photoError && <p className="mt-1 text-xs text-risk-critical">{photoError}</p>}
            <p className="mt-1 text-[11px] text-paper-faint">{t('homestayPhotoHint')}</p>
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm text-paper-muted">
              {t('homestayName')}
              <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text" />
            </label>
            <label className="text-sm text-paper-muted">
              {t('homestayType')}
              <select value={type} onChange={(e) => setType(e.target.value as HomestayType)} className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text">
                {TYPES.map((v) => (
                  <option key={v} value={v}>
                    {TYPE_EMOJI[v]} {TYPE_LABEL[v]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm text-paper-muted">
            {t('homestayArea')}
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
              maxLength={100}
              list="nashik-areas"
              placeholder={t('homestayAreaPlaceholder')}
              className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
            />
            <datalist id="nashik-areas">
              {NASHIK_LANDMARKS.map((l) => (
                <option key={l.id} value={l.name} />
              ))}
            </datalist>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="text-sm text-paper-muted">
              {t('homestayPriceMin')}
              <input type="number" min={0} value={priceMin} onChange={(e) => setPriceMin(e.target.value)} required className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text" />
            </label>
            <label className="text-sm text-paper-muted">
              {t('homestayPriceMax')}
              <input type="number" min={0} value={priceMax} onChange={(e) => setPriceMax(e.target.value)} required className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text" />
            </label>
            <label className="text-sm text-paper-muted">
              {t('homestayCapacity')}
              <input type="number" min={1} max={50} value={capacity} onChange={(e) => setCapacity(e.target.value)} required className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text" />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm text-paper-muted">
              {t('homestayContactName')}
              <input value={contactName} onChange={(e) => setContactName(e.target.value)} required maxLength={100} className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text" />
            </label>
            <label className="text-sm text-paper-muted">
              {t('homestayContactPhone')}
              <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required maxLength={20} className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text" />
            </label>
          </div>
          <label className="block text-sm text-paper-muted">
            {t('homestayAmenities')}
            <input
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              placeholder={t('homestayAmenitiesPlaceholder')}
              className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
            />
          </label>
          <label className="block text-sm text-paper-muted">
            {t('homestayDescription')} <span className="text-risk-critical">*</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={1000}
              rows={3}
              placeholder={t('homestayDescriptionPlaceholder')}
              className="mt-1 block w-full rounded-md border border-paper-border bg-paper-surface px-3 py-1.5 text-sm text-paper-text"
            />
          </label>
          {submitState === 'error' && <p className="text-sm text-risk-critical">{submitError}</p>}
          <button type="submit" disabled={submitState === 'submitting'} className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50">
            {submitState === 'submitting' ? t('homestaySaving') : t('homestaySaveListing')}
          </button>
        </form>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setFilterType('ALL')} className={`rounded-full border px-3 py-1 text-xs font-medium ${filterType === 'ALL' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-paper-border text-paper-muted'}`}>
          {t('filterAll')}
        </button>
        {TYPES.map((v) => (
          <button key={v} onClick={() => setFilterType(v)} className={`rounded-full border px-3 py-1 text-xs font-medium ${filterType === v ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-paper-border text-paper-muted'}`}>
            {TYPE_EMOJI[v]} {TYPE_LABEL[v]}
          </button>
        ))}
      </div>

      <AsyncState status={api.status} errorMessage={api.errorMessage} onRetry={api.retry} emptyMessage={t('homestayNoneYet')}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <div key={l.id} className="paper-card overflow-hidden p-0">
              {l.photoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.photoDataUrl} alt={l.name} className="h-36 w-full object-cover" />
              ) : (
                <div className="flex h-36 w-full items-center justify-center bg-brand-50 text-4xl">{TYPE_EMOJI[l.type]}</div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-paper-text">
                    {TYPE_EMOJI[l.type]} {l.name}
                  </p>
                  {l.dataSource === 'SIMULATED' && <span className="pill shrink-0 border border-paper-border text-[10px] text-paper-faint">{t('homestayExampleBadge')}</span>}
                </div>
                <p className="mt-0.5 text-xs text-paper-muted">📍 {l.area}</p>
                <p className="mt-2 text-sm font-semibold text-brand-700">
                  ₹{l.pricePerNightMin}–{l.pricePerNightMax} <span className="font-normal text-paper-faint">/ night</span>
                </p>
                <p className="mt-0.5 text-xs text-paper-muted">{t('homestayCapacityLabel')}: {l.capacity}</p>
                {l.amenities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {l.amenities.map((a, i) => (
                      <span key={i} className="pill border border-paper-border text-[10px] text-paper-muted">
                        {a}
                      </span>
                    ))}
                  </div>
                )}
                {l.description && <p className="mt-2 text-xs text-paper-muted">{l.description}</p>}
                <a
                  href={`tel:${l.contactPhone.replace(/\s/g, '')}`}
                  className="fast-transition mt-3 flex items-center justify-center gap-1.5 rounded-md bg-brand-500 py-2 text-xs font-semibold text-white hover:bg-brand-600"
                >
                  <Phone size={13} /> {t('homestayCall')} {l.contactName}
                </a>
              </div>
            </div>
          ))}
        </div>
      </AsyncState>
    </div>
  );
}
