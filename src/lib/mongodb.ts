import { MongoClient, Db } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';

/** Opciones de cliente: `maxIdleTimeMS` es requerido para que `attachDatabasePool` reconozca el pool de MongoDB en Vercel. */
const clientOptions = {
  maxIdleTimeMS: 60_000,
};

/** Nombre de base de datos. Si la URI incluye `/nombre` tras el host, se usa ese; si no, `MONGO_DB_NAME` o `digital-church`. */
function resolveDatabaseName(connection: string): string {
  if (process.env.MONGO_DB_NAME?.trim()) {
    return process.env.MONGO_DB_NAME.trim();
  }
  const noQuery = connection.split('?')[0];
  const segments = noQuery.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  if (last && !last.includes('@') && !last.includes('.')) {
    return decodeURIComponent(last);
  }
  return 'digital-church';
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function requireMongoUri(): string {
  const uri =
    process.env.STORAGE_MONGODB_URI?.trim() ||
    process.env.MONGO_DB?.trim();
  if (!uri) {
    throw new Error(
      'Falta STORAGE_MONGODB_URI (o MONGO_DB como respaldo) con la cadena de conexión de MongoDB.'
    );
  }
  return uri;
}

function createClientPromise(): Promise<MongoClient> {
  const uri = requireMongoUri();
  const client = new MongoClient(uri, clientOptions);
  attachDatabasePool(client);
  return client.connect();
}

function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createClientPromise();
    }
    return global._mongoClientPromise;
  }
  if (!productionClientPromise) {
    productionClientPromise = createClientPromise();
  }
  return productionClientPromise;
}

let productionClientPromise: Promise<MongoClient> | null = null;

/** Promesa del cliente (útil en API routes). No usar en componentes cliente. */
export default getClientPromise;

export async function getMongoClient(): Promise<MongoClient> {
  return getClientPromise();
}

export async function getDb(): Promise<Db> {
  const uri = requireMongoUri();
  const client = await getClientPromise();
  return client.db(resolveDatabaseName(uri));
}
