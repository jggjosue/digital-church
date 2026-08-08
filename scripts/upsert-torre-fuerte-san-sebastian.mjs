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
  id: 'iglesia-cristiana-torre-fuerte-san-sebastian',
  name: 'Torre Fuerte Gómez Farías',
  normalizedName: 'torre fuerte gomez farias',
  address: 'Del Valle 15, Col. Santa Cecilia, 49120 San Sebastián del Sur, Jal.',
  municipality: 'Gómez Farías',
  country: 'mexico',
  lat: 19.7935613,
  lng: -103.4749503,
  embedUrl: 'https://maps.google.com/maps?q=Torre%20Fuerte%20G%C3%B3mez%20Far%C3%ADas%2C%20Del%20Valle%2015%2C%20Santa%20Cecilia%2C%2049120%20San%20Sebasti%C3%A1n%20del%20Sur%2C%20Jalisco&z=16&output=embed',
  shareMapUrl: 'https://maps.app.goo.gl/zrSyaeKuB3upBheR6?g_st=aw',
  phone: '',
  schedule: [],
  createdAt: new Date().toISOString(),
  streetAddress: 'Del Valle 15',
  neighborhood: 'Santa Cecilia',
  zip: '49120',
  city: 'San Sebastián del Sur',
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
