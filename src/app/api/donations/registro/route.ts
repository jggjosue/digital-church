import { readOfferingRegistry, writeOfferingRegistry } from '@/lib/offering-registry-api';

const OPTIONS = { collection: 'offering_registry', sourceScreen: '/donations/registro', label: 'Registro de ofrendas', logScope: 'api/donations/registro' };

export async function GET(request: Request) {
  return readOfferingRegistry(request, OPTIONS);
}

export async function PUT(request: Request) {
  return writeOfferingRegistry(request, OPTIONS);
}
