import { MongoClient, Db } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';

/** Opciones de cliente: `maxIdleTimeMS` es requerido para que `attachDatabasePool` reconozca el pool de MongoDB en Vercel. */
const clientOptions = {
  maxIdleTimeMS: 60_000,
};

/**
 * Resuelve el nombre de la base de datos según el ambiente (dev vs prod) y el usuario.
 * - Si `MONGO_DB_NAME` está definido explícitamente en el entorno, se prioriza.
 * - En Producción (`NODE_ENV === 'production'`), apunta a `digital-church` (o `MONGO_DB_NAME_PROD`).
 * - En Desarrollo (`NODE_ENV !== 'production'`), para el usuario `joshuesitogonzalez2012@gmail.com` (o en dev), apunta a `test` (o `MONGO_DB_NAME_DEV`).
 */
export function resolveDatabaseName(connection: string, userEmail?: string): string {
  if (process.env.MONGO_DB_NAME?.trim()) {
    return process.env.MONGO_DB_NAME.trim();
  }

  const isProd = process.env.NODE_ENV === 'production';
  const devTestUser = process.env.DEV_TEST_USER_EMAIL?.trim() || 'joshuesitogonzalez2012@gmail.com';
  const devDbName = process.env.MONGO_DB_NAME_DEV?.trim() || 'test';
  const prodDbName = process.env.MONGO_DB_NAME_PROD?.trim() || 'digital-church';

  if (isProd) {
    return prodDbName;
  }

  // Ambiente desarrollo
  if (!userEmail || userEmail.toLowerCase() === devTestUser.toLowerCase()) {
    return devDbName;
  }

  return devDbName;
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

export async function getDb(userEmail?: string): Promise<Db> {
  const uri = requireMongoUri();
  const client = await getClientPromise();
  
  let email = userEmail;
  if (!email && typeof window === 'undefined') {
    try {
      const { currentUser } = await import('@clerk/nextjs/server');
      const user = await currentUser();
      email = user?.primaryEmailAddress?.emailAddress;
    } catch {
      // Ignorar si se ejecuta fuera del contexto de una solicitud HTTP de Clerk
    }
  }

  return client.db(resolveDatabaseName(uri, email));
}
