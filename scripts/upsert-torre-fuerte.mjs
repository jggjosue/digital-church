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
  id: 'torre-fuerte-iciar',
  name: 'Torre Fuerte ICIAR',
  normalizedName: 'torre fuerte iciar',
  address: 'C. María Ciudadano Bancalari 3222, esq. C. Adolfo Cisneros 1216, Echeverría, 44970 Guadalajara, Jal.',
  municipality: 'Guadalajara',
  country: 'mexico',
  lat: 20.6236204,
  lng: -103.3645749,
  embedUrl: 'https://maps.google.com/maps?q=Torre%20Fuerte%20ICIAR%2C%20Mar%C3%ADa%20Ciudadano%20Bancalari%203222%2C%20Adolfo%20Cisneros%201216%2C%20Echeverr%C3%ADa%2C%2044970%20Guadalajara%2C%20Jalisco&z=16&output=embed',
  shareMapUrl: 'https://maps.app.goo.gl/6WNHzWs9GUC3GxiY8?g_st=aw',
  phone: '',
  schedule: [],
  createdAt: new Date().toISOString(),
  streetAddress: 'C. María Ciudadano Bancalari 3222 / C. Adolfo Cisneros 1216',
  neighborhood: 'Echeverría',
  zip: '44970',
  city: 'Guadalajara',
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
