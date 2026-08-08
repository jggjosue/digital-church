import {
  readOfferingRegistry,
  writeOfferingRegistry,
} from '@/lib/offering-registry-api';

const SPECIAL_EVENTS_COLLECTION = 'special_event_offering_registry';
const SOURCE_SCREEN = '/donations/eventos-especiales';

export async function GET(request: Request) {
  return readOfferingRegistry(request, {
    collection: SPECIAL_EVENTS_COLLECTION,
    sourceScreen: SOURCE_SCREEN,
    label: 'Registro de eventos especiales',
    logScope: 'api/donations/eventos-especiales',
  });
}

export async function PUT(request: Request) {
  return writeOfferingRegistry(request, {
    collection: SPECIAL_EVENTS_COLLECTION,
    sourceScreen: SOURCE_SCREEN,
    label: 'Registro de eventos especiales',
    logScope: 'api/donations/eventos-especiales',
  });
}
