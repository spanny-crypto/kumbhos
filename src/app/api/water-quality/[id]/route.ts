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

// Every field is editable by Command Centre staff — this route accepts a
// partial patch so an operator can, say, correct just the fecal coliform
// figure or add a source URL without resubmitting the whole record.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return withApiErrors(async () => {
    const session = requireWriteAccess();
    const body = (await req.json().catch(() => null)) as Partial<WaterQualityInput> | null;
    if (!body) return apiError('VALIDATION_ERROR', 'A JSON body is required.');

    if (body.year !== undefined && (typeof body.year !== 'number' || body.year < 1900 || body.year > 2100)) {
      return apiError('VALIDATION_ERROR', 'Invalid year.');
    }
    if (body.bathingStandardVerdict !== undefined && !VALID_VERDICTS.includes(body.bathingStandardVerdict)) {
      return apiError('VALIDATION_ERROR', 'Invalid bathingStandardVerdict.');
    }
    if (body.riskLevel !== undefined && !VALID_RISK_LEVELS.includes(body.riskLevel)) {
      return apiError('VALIDATION_ERROR', 'Invalid riskLevel.');
    }
    if (body.dataSource !== undefined && !VALID_DATA_SOURCES.includes(body.dataSource)) {
      return apiError('VALIDATION_ERROR', 'Invalid dataSource.');
    }
    for (const key of ['ph', 'dissolvedOxygenMgL', 'bodMgL', 'fecalColiformMpn100ml'] as const) {
      if (body[key] !== undefined && !isValidReading(body[key])) {
        return apiError('VALIDATION_ERROR', `${key} must be a number, a {min,max} range, or null.`);
      }
    }
    if (body.summary !== undefined && body.summary.length > 2000) return apiError('VALIDATION_ERROR', 'Summary is too long.');

    const data = getDataProvider();
    const updated = await data.updateWaterQualityRecord(params.id, body, session.name);
    if (!updated) return apiError('NOT_FOUND', 'That water quality record could not be found.');
    return apiSuccess(updated);
  });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  return withApiErrors(async () => {
    requireWriteAccess();
    const data = getDataProvider();
    const deleted = await data.deleteWaterQualityRecord(params.id);
    if (!deleted) return apiError('NOT_FOUND', 'That water quality record could not be found.');
    return apiSuccess({ deleted: true });
  });
}
