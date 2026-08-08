import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.STORAGE_MONGODB_URI?.trim() || process.env.MONGO_DB?.trim();
if (!uri) throw new Error('Falta STORAGE_MONGODB_URI o MONGO_DB.');

const databaseName =
  process.env.MONGO_DB_NAME?.trim() ||
  process.env.MONGO_DB_NAME_DEV?.trim() ||
  'test';
const client = new MongoClient(uri);

const church = {
  id: 'iciar-chapala',
  name: 'ICIAR Chapala',
  normalizedName: 'iciar chapala',
  address: 'Emiliano Zapata 47, 45900 Chapala, Jal.',
  municipality: 'Chapala',
  country: 'mexico',
  lat: 20.3014062,
  lng: -103.1930671,
  embedUrl: 'https://maps.google.com/maps?q=Iglesia%20Cristiana%20Interdenominacional%2C%20Emiliano%20Zapata%2047%2C%2045900%20Chapala%2C%20Jalisco&z=16&output=embed',
  shareMapUrl: 'https://www.google.com/maps/search/?api=1&query=Iglesia%20Cristiana%20Interdenominacional%2C%20Emiliano%20Zapata%2047%2C%2045900%20Chapala%2C%20Jalisco',
  phone: '',
  schedule: [],
  createdAt: new Date().toISOString(),
  streetAddress: 'Emiliano Zapata 47',
  neighborhood: 'Centro',
  zip: '45900',
  city: 'Chapala',
  state: 'Jalisco',
  description: 'Iglesia Cristiana Interdenominacional de la República Mexicana en Chapala.',
};

const { createdAt, ...churchFields } = church;

try {
  await client.connect();
  const collection = client.db(databaseName).collection('churches');
  const existing = await collection.findOne({
    $or: [{ id: church.id }, { normalizedName: church.normalizedName }],
  });
  const filter = existing?._id ? { _id: existing._id } : { id: church.id };
  const result = await collection.updateOne(
    filter,
    { $set: churchFields, $setOnInsert: { createdAt } },
    { upsert: true },
  );
  console.log(JSON.stringify({
    database: databaseName,
    id: church.id,
    inserted: result.upsertedCount === 1,
    updated: result.modifiedCount === 1,
  }, null, 2));
} finally {
  await client.close();
}
