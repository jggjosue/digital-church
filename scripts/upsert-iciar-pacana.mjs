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
  id: 'iciar-pacana',
  name: 'ICIAR Pacana',
  normalizedName: 'iciar pacana',
  address: 'Castro Urdiales (Pacana), 45325 Tala, Jal.',
  municipality: 'Tala',
  country: 'mexico',
  lat: 20.60455,
  lng: -103.82203,
  embedUrl: 'https://maps.google.com/maps?q=ICIAR%20Pacana%2C%20Castro%20Urdiales%20Pacana%2C%2045325%20Tala%2C%20Jalisco&z=15&output=embed',
  shareMapUrl: 'https://www.google.com/maps/search/?api=1&query=ICIAR%20Pacana%2C%20Castro%20Urdiales%20Pacana%2C%2045325%20Tala%2C%20Jalisco',
  phone: '',
  schedule: [],
  createdAt: new Date().toISOString(),
  streetAddress: '',
  neighborhood: 'Castro Urdiales (Pacana)',
  zip: '45325',
  city: 'Pacana',
  state: 'Jalisco',
  description: 'Iglesia Cristiana Interdenominacional en la localidad de Pacana, municipio de Tala.',
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
