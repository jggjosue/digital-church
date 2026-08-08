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
  id: 'templo-puerta-del-rey-iciar',
  name: 'Templo Puerta del Rey ICIAR',
  normalizedName: 'templo puerta del rey iciar',
  address: 'Biblia 328, La Duraznera, 45580 San Pedro Tlaquepaque, Jal.',
  municipality: 'San Pedro Tlaquepaque',
  country: 'mexico',
  lat: 0,
  lng: 0,
  embedUrl: 'https://maps.google.com/maps?q=Templo%20Puerta%20del%20Rey%20ICIAR%2C%20Biblia%20328%2C%20La%20Duraznera%2C%2045580%20San%20Pedro%20Tlaquepaque%2C%20Jalisco&z=16&output=embed',
  shareMapUrl: 'https://maps.app.goo.gl/hd4drqqqe9aC3a7z7?g_st=aw',
  phone: '',
  schedule: [],
  createdAt: new Date().toISOString(),
  streetAddress: 'Biblia 328',
  neighborhood: 'La Duraznera',
  zip: '45580',
  city: 'San Pedro Tlaquepaque',
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
