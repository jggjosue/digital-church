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
  id: 'iciar-maranatha-ixtapaluca',
  name: 'ICIAR Iglesia Cristiana Maranatha Ixtapaluca',
  normalizedName: 'iciar iglesia cristiana maranatha ixtapaluca',
  address: 'Alfonso Reyes 2, La Venta, 56530 Ixtapaluca, Méx.',
  municipality: 'Ixtapaluca',
  country: 'mexico',
  lat: 19.3103935,
  lng: -98.8839267,
  embedUrl: 'https://maps.google.com/maps?q=ICIAR%20Iglesia%20Cristiana%20Maranatha%20Ixtapaluca%2C%20Alfonso%20Reyes%202%2C%20La%20Venta%2C%2056530%20Ixtapaluca%2C%20Estado%20de%20M%C3%A9xico&z=16&output=embed',
  shareMapUrl: 'https://share.google/yKhDzVbSoqWyyC4Jd',
  phone: '',
  schedule: [],
  createdAt: new Date().toISOString(),
  streetAddress: 'Alfonso Reyes 2',
  neighborhood: 'La Venta',
  zip: '56530',
  city: 'Ixtapaluca',
  state: 'Estado de México',
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
