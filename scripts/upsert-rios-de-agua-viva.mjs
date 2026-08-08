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
  id: 'iglesia-cristiana-rios-de-agua-viva-iciar',
  name: 'Iglesia Cristiana Ríos de Agua Viva ICIAR',
  normalizedName: 'iglesia cristiana rios de agua viva iciar',
  address: 'Prol. Av. Tepeyac 975, Paraísos del Colli, 45069 Zapopan, Jal.',
  municipality: 'Zapopan',
  country: 'mexico',
  lat: 21.4771268,
  lng: -104.9034752,
  embedUrl: 'https://maps.google.com/maps?q=21.4771268%2C-104.9034752&z=16&output=embed',
  shareMapUrl: 'https://maps.app.goo.gl/ezgRbiHxzeEqbNTa8?g_st=iw',
  phone: '',
  schedule: [],
  createdAt: new Date().toISOString(),
  streetAddress: 'Prol. Av. Tepeyac 975',
  neighborhood: 'Paraísos del Colli',
  zip: '45069',
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
    {
      $set: churchFields,
      $setOnInsert: { createdAt },
    },
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
