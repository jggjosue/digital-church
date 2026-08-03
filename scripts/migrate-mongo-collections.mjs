import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.STORAGE_MONGODB_URI?.trim() || process.env.MONGO_DB?.trim();
if (!uri) throw new Error('Falta STORAGE_MONGODB_URI o MONGO_DB.');

const databaseName = process.env.MONGO_DB_NAME?.trim() || 'digital-church';
const client = new MongoClient(uri);

const requiredCollections = [
  'events', 'ceremonies', 'groups', 'volunteers', 'volunteer_tasks',
  'volunteer_schedules', 'prayer_requests', 'sermons', 'sermon_media',
  'facilities', 'facility_bookings', 'financial_transactions', 'budgets',
  'funds', 'pledges', 'offering_registry', 'attendance_events',
  'attendance_registry', 'inventory_items', 'inventory_taxonomy',
  'inventory_church_areas', 'member_photo_uploads',
  'audit_log', 'financial_record_versions', 'annual_registry_versions',
];

async function copyDocuments(source, target, filter) {
  const documents = await source.find(filter).toArray();
  if (!documents.length) return 0;
  let copied = 0;
  for (const document of documents) {
    const identity = document.id ? { id: document.id } : { _id: document._id };
    const result = await target.replaceOne(identity, document, { upsert: true });
    if (result.upsertedCount || result.modifiedCount) copied += 1;
  }
  return copied;
}

try {
  await client.connect();
  const db = client.db(databaseName);
  const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map(({ name }) => name));
  for (const name of requiredCollections) {
    if (!existing.has(name)) await db.createCollection(name);
  }

  const legacyAttendance = db.collection('attendance');
  const attendanceEventsCopied = await copyDocuments(
    legacyAttendance,
    db.collection('attendance_events'),
    { eventType: { $in: ['service', 'event'] } },
  );
  const attendanceRegistryCopied = await copyDocuments(
    legacyAttendance,
    db.collection('attendance_registry'),
    { records: { $exists: true } },
  );

  const legacyInventory = db.collection('inventory');
  const inventoryItemsCopied = await copyDocuments(
    legacyInventory,
    db.collection('inventory_items'),
    { docType: { $nin: ['church_inventory_areas', 'inventory_taxonomy'] } },
  );
  const inventoryTaxonomyCopied = await copyDocuments(
    legacyInventory,
    db.collection('inventory_taxonomy'),
    { docType: 'inventory_taxonomy' },
  );
  const inventoryAreasCopied = await copyDocuments(
    legacyInventory,
    db.collection('inventory_church_areas'),
    { docType: 'church_inventory_areas' },
  );

  const uniqueIdCollections = requiredCollections.filter((name) => ![
    'attendance_registry', 'offering_registry', 'inventory_taxonomy', 'inventory_church_areas',
  ].includes(name));
  for (const name of uniqueIdCollections) {
    await db.collection(name).createIndex({ id: 1 }, { unique: true, sparse: true });
    await db.collection(name).createIndex({ churchId: 1, createdAt: -1 });
  }
  await db.collection('attendance_registry').createIndex({ churchId: 1, year: 1 }, { unique: true });
  await db.collection('offering_registry').createIndex({ churchId: 1, year: 1 }, { unique: true });
  await db.collection('inventory_taxonomy').createIndex({ id: 1 }, { unique: true, sparse: true });
  await db.collection('inventory_church_areas').createIndex({ churchId: 1 }, { unique: true, sparse: true });
  await db.collection('audit_log').createIndex({ collection: 1, entityId: 1, timestamp: -1 });
  await db.collection('audit_log').createIndex({ 'actor.id': 1, timestamp: -1 });
  await db.collection('financial_record_versions').createIndex({ sourceCollection: 1, entityId: 1, archivedAt: -1 });
  await db.collection('annual_registry_versions').createIndex({ sourceCollection: 1, entityId: 1, archivedAt: -1 });

  console.log(JSON.stringify({
    database: databaseName,
    ensuredCollections: requiredCollections.length,
    migrated: { attendanceEventsCopied, attendanceRegistryCopied, inventoryItemsCopied, inventoryTaxonomyCopied, inventoryAreasCopied },
  }, null, 2));
} finally {
  await client.close();
}
