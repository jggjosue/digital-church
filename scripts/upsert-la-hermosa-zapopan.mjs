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
  id: 'iglesia-interdenominacional-la-hermosa-zapopan',
  name: 'Iglesia Cristiana Interdenominacional La Hermosa',
  normalizedName: 'iglesia cristiana interdenominacional la hermosa',
  address: 'Fray Toribio de Motolinía 1363, Col. San Francisco, 45140 Zapopan, Jal.',
  municipality: 'Zapopan',
  country: 'mexico',
  lat: 20.7284436,
  lng: -103.4040046,
  embedUrl: 'https://maps.google.com/maps?q=Iglesia%20Cristiana%20Interdenominacional%20La%20Hermosa%2C%20Fray%20Toribio%20de%20Motolin%C3%ADa%201363%2C%20San%20Francisco%2C%2045140%20Zapopan%2C%20Jalisco&z=16&output=embed',
  shareMapUrl: 'https://maps.app.goo.gl/nUMqZuQEaZUnFtZG9?g_st=aw',
  phone: '',
  schedule: [],
  createdAt: new Date().toISOString(),
  streetAddress: 'Fray Toribio de Motolinía 1363',
  neighborhood: 'San Francisco',
  zip: '45140',
  city: 'Zapopan',
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
