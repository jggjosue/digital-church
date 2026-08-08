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
  id: 'templo-sayula-rios-de-agua-viva-iciar',
  name: 'Templo Sayula Congregación Ríos de Agua Viva ICIAR',
  normalizedName: 'templo sayula congregacion rios de agua viva iciar',
  address: 'C. Benito Juárez 267, Col. Aguacatera, 49314 Sayula, Jal.',
  municipality: 'Sayula',
  country: 'mexico',
  lat: 19.8728619,
  lng: -103.6031265,
  embedUrl: 'https://maps.google.com/maps?q=19.8728619%2C-103.6031265&z=18&output=embed',
  shareMapUrl: 'https://maps.app.goo.gl/ZVJzpK4RsPzipvRXA?g_st=aw',
  phone: '',
  schedule: [],
  createdAt: new Date().toISOString(),
  streetAddress: 'C. Benito Juárez 267',
  neighborhood: 'Aguacatera',
  zip: '49314',
  city: 'Sayula',
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
