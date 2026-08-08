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
  id: 'monte-sion-gomez-farias',
  name: 'Monte Sion Gómez Farías',
  normalizedName: 'monte sion gomez farias',
  address: 'C. Cedro Blanco 100, Fracc. San Pedro, Col. Iprovipe, 49120 Gómez Farías, Jal.',
  municipality: 'Gómez Farías',
  country: 'mexico',
  lat: 19.7935613,
  lng: -103.4749503,
  embedUrl: 'https://maps.google.com/maps?q=Templo%20Monte%20Sion%2C%20Cedro%20Blanco%20100%2C%20Fraccionamiento%20San%20Pedro%2C%20Iprovipe%2C%2049120%20G%C3%B3mez%20Far%C3%ADas%2C%20Jalisco&z=17&output=embed',
  shareMapUrl: 'https://www.google.com/maps/search/?api=1&query=Templo%20Monte%20Sion%2C%20Cedro%20Blanco%20100%2C%20Fraccionamiento%20San%20Pedro%2C%20Iprovipe%2C%20G%C3%B3mez%20Far%C3%ADas%2C%20Jalisco',
  phone: '',
  schedule: [],
  createdAt: new Date().toISOString(),
  streetAddress: 'C. Cedro Blanco 100',
  neighborhood: 'Fraccionamiento San Pedro, Col. Iprovipe',
  zip: '49120',
  city: 'San Sebastián del Sur',
  state: 'Jalisco',
  description: 'Templo Monte Sion en el municipio de Gómez Farías, Jalisco.',
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
