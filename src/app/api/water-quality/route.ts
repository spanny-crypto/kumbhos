import { getDataProvider } from '@/lib/data';
import { apiSuccess, apiError } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';
import { requireWriteAccess } from '@/lib/auth/rbac';
import type { WaterQualityInput } from '@/lib/data/provider';
import type { ReadingValue } from '@/lib/data/types';

export const dynamic = 'force-dynamic';

const VALID_VERDICTS = ['MEETS_STANDARD', 'EXCEEDS_STANDARD', 'PARTIAL', 'DISPUTED'];
const VALID_RISK_LEVELS = ['LOW', 'MODERATE', 'HIGH', 'DISPUTED'];
const VALID_DATA_SOURCES = ['SIMULATED', 'LIVE', 'GOVERNMENT_OPEN_DATA', 'DERIVED', 'USER_REPORTED'];

function isValidReading(value: unknown): value is ReadingValue {
  if (value === null || value === undefined) return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    return typeof v.min === 'number' && typeof v.max === 'number';
  }
  return false;
}

// Publicly readable — this is the whole point of a transparency feature.
// All writes require an authenticated Command Centre account with write
// access (requireWriteAccess), matching every other editable dataset in
// the app; see docs/SECURITY.md.
export async function GET() {
  return withApiErrors(async () => {
    const data = getDataProvider();
    return apiSuccess(await data.getWaterQualityRecords());
  });
}

export async function POST(req: Request) {
  return withApiErrors(async () => {
    const session = requireWriteAccess();
    const body = (await req.json().catch(() => null)) as Partial<WaterQualityInput> | null;

    if (!body || !body.kumbhEvent || !body.year || !body.location || !body.samplingPeriod || !body.summary || !body.sourcePublisher || !body.sourceUrl || !body.sourceDate) {
      return apiError('VALIDATION_ERROR', 'kumbhEvent, year, location, samplingPeriod, summary, sourcePublisher, sourceUrl, and sourceDate are required.');
    }
    if (typeof body.year !== 'number' || body.year < 1900 || body.year > 2100) return apiError('VALIDATION_ERROR', 'Invalid year.');
    if (!body.bathingStandardVerdict || !VALID_VERDICTS.includes(body.bathingStandardVerdict)) return apiError('VALIDATION_ERROR', 'Invalid bathingStandardVerdict.');
    if (!body.riskLevel || !VALID_RISK_LEVELS.includes(body.riskLevel)) return apiError('VALIDATION_ERROR', 'Invalid riskLevel.');
    if (!body.dataSource || !VALID_DATA_SOURCES.includes(body.dataSource)) return apiError('VALIDATION_ERROR', 'Invalid dataSource.');
    if (!isValidReading(body.ph) || !isValidReading(body.dissolvedOxygenMgL) || !isValidReading(body.bodMgL) || !isValidReading(body.fecalColiformMpn100ml)) {
      return apiError('VALIDATION_ERROR', 'Reading values must be a number, a {min,max} range, or null.');
    }
    if (body.summary.length > 2000 || body.kumbhEvent.length > 200 || body.location.length > 300) {
      return apiError('VALIDATION_ERROR', 'One or more fields exceed the maximum length.');
    }

    const data = getDataProvider();
    const created = await data.createWaterQualityRecord(
      {
        kumbhEvent: body.kumbhEvent,
        year: body.year,
        location: body.location,
        samplingPeriod: body.samplingPeriod,
        ph: body.ph ?? null,
        dissolvedOxygenMgL: body.dissolvedOxygenMgL ?? null,
        bodMgL: body.bodMgL ?? null,
        fecalColiformMpn100ml: body.fecalColiformMpn100ml ?? null,
        bathingStandardVerdict: body.bathingStandardVerdict,
        riskLevel: body.riskLevel,
        summary: body.summary,
        notes: body.notes ?? null,
        sourcePublisher: body.sourcePublisher,
        sourceUrl: body.sourceUrl,
        sourceDate: body.sourceDate,
        dataSource: body.dataSource
      },
      session.name
    );
    return apiSuccess(created);
  });
}
