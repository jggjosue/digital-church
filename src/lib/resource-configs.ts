import type { ResourceConfig } from '@/lib/mongo-resource';
import {
  budgetSchema,
  ceremonySchema,
  eventSchema,
  facilityBookingSchema,
  facilitySchema,
  financialTransactionSchema,
  fundSchema,
  groupSchema,
  pledgeSchema,
  prayerRequestSchema,
  sermonMediaSchema,
  sermonSchema,
  volunteerScheduleSchema,
  volunteerSchema,
  volunteerTaskSchema,
} from '@/lib/persistence-schemas';

export const RESOURCE_CONFIGS = {
  events: { collection: 'events', schema: eventSchema, searchFields: ['title', 'description', 'location'] },
  ceremonies: { collection: 'ceremonies', schema: ceremonySchema, searchFields: ['type', 'participants', 'officiant'] },
  groups: { collection: 'groups', schema: groupSchema, searchFields: ['name', 'description', 'category'] },
  volunteers: { collection: 'volunteers', schema: volunteerSchema, searchFields: ['firstName', 'lastName', 'email', 'primaryRole'] },
  'volunteer-tasks': { collection: 'volunteer_tasks', schema: volunteerTaskSchema, searchFields: ['title', 'description'] },
  'volunteer-schedules': { collection: 'volunteer_schedules', schema: volunteerScheduleSchema, searchFields: ['title', 'location'] },
  'prayer-requests': { collection: 'prayer_requests', schema: prayerRequestSchema, searchFields: ['title', 'description'] },
  sermons: { collection: 'sermons', schema: sermonSchema, searchFields: ['title', 'speaker', 'series', 'scripture'] },
  'sermon-media': { collection: 'sermon_media', schema: sermonMediaSchema, searchFields: ['title', 'type'] },
  facilities: { collection: 'facilities', schema: facilitySchema, searchFields: ['name', 'location', 'category'] },
  'facility-bookings': { collection: 'facility_bookings', schema: facilityBookingSchema, searchFields: ['title', 'requestedBy'] },
  'financial-transactions': { collection: 'financial_transactions', schema: financialTransactionSchema, searchFields: ['category', 'description', 'reference'] },
  budgets: { collection: 'budgets', schema: budgetSchema, searchFields: ['name', 'category'] },
  funds: { collection: 'funds', schema: fundSchema, searchFields: ['name', 'description'] },
  pledges: { collection: 'pledges', schema: pledgeSchema, searchFields: ['donorName', 'notes'] },
} satisfies Record<string, ResourceConfig>;

export type ResourceName = keyof typeof RESOURCE_CONFIGS;

export function getResourceConfig(name: string) {
  return RESOURCE_CONFIGS[name as ResourceName] ?? null;
}
