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
  id: 'templo-divino-alfarero-tonala',
  name: 'Templo Divino Alfarero',
  normalizedName: 'templo divino alfarero',
  address: 'Galeana 151, Col. Centro, 45400 Tonalá, Jal.',
  municipality: 'Tonalá',
  country: 'mexico',
  lat: 20.6194871,
  lng: -103.2437876,
  embedUrl: 'https://maps.google.com/maps?q=Templo%20Divino%20Alfarero%2C%20Galeana%20151%2C%20Centro%2C%2045400%20Tonal%C3%A1%2C%20Jalisco&z=16&output=embed',
  shareMapUrl: 'https://www.google.com/maps/search/?api=1&query=Templo%20Divino%20Alfarero%2C%20Galeana%20151%2C%20Centro%2C%2045400%20Tonal%C3%A1%2C%20Jalisco',
  phone: '',
  schedule: [],
  createdAt: new Date().toISOString(),
  streetAddress: 'Galeana 151',
  neighborhood: 'Centro',
  zip: '45400',
  city: 'Tonalá',
  state: 'Jalisco',
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
