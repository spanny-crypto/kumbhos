import { getDataProvider } from '@/lib/data';
import { apiSuccess, apiError } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';
import type { CreateHomestayInput } from '@/lib/data/provider';

export const dynamic = 'force-dynamic';

const VALID_TYPES = ['HOMESTAY', 'GUESTHOUSE', 'DHARAMSHALA', 'HOTEL', 'PG'];
const PHONE_PATTERN = /^[0-9+()\-\s]{7,20}$/;

// Public read/write, same reasoning as Lost & Found and Wristbands: a host
// listing a spare room needs no sign-in, and the whole point of a listing
// is that any pilgrim can see the contact number without an account.
export async function GET() {
  return withApiErrors(async () => {
    const data = getDataProvider();
    const listings = await data.getHomestayListings();
    return apiSuccess(listings);
  });
}

export async function POST(req: Request) {
  return withApiErrors(async () => {
    const body = (await req.json().catch(() => null)) as Partial<CreateHomestayInput> | null;
    if (!body || !body.name || !body.area || !body.contactName || !body.contactPhone || !body.description || !body.photoDataUrl) {
      return apiError('VALIDATION_ERROR', 'name, area, contactName, contactPhone, description, and a property photo are required.');
    }
    if (!body.photoDataUrl.startsWith('data:image/')) {
      return apiError('VALIDATION_ERROR', 'Property photo could not be read — please try a different image.');
    }
    if (body.description.length > 1000) {
      return apiError('VALIDATION_ERROR', 'Description is too long.');
    }
    if (body.type && !VALID_TYPES.includes(body.type)) {
      return apiError('VALIDATION_ERROR', 'Invalid listing type.');
    }
    if (!PHONE_PATTERN.test(body.contactPhone)) {
      return apiError('VALIDATION_ERROR', 'Enter a valid contact phone number.');
    }
    if (body.name.length > 100 || body.area.length > 100 || body.contactName.length > 100) {
      return apiError('VALIDATION_ERROR', 'Name, area, or contact name is too long.');
    }

    const data = getDataProvider();
    const created = await data.createHomestayListing({
      name: body.name,
      type: body.type ?? 'HOMESTAY',
      area: body.area,
      pricePerNightMin: Number(body.pricePerNightMin) || 0,
      pricePerNightMax: Number(body.pricePerNightMax) || 0,
      capacity: Number(body.capacity) || 1,
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
      description: body.description,
      photoDataUrl: body.photoDataUrl
    });
    return apiSuccess(created);
  });
}
