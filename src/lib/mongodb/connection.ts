import mongoose from 'mongoose';

// Define a type for our cached mongoose instance
type CachedMongoose = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Define the type for the cached mongoose connection
declare global {
  var mongoose: CachedMongoose | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached: CachedMongoose | undefined = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(dbName?: string) {
  // Ensure cached is defined
  if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Assert MONGODB_URI is defined (we already checked above, but TypeScript needs this)
    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }

    // If a database name is provided, use it
    let uri = MONGODB_URI;
    if (dbName) {
      // Parse the URI to insert the database name
      const urlParts = new URL(MONGODB_URI);
      // Set the pathname to the database name (removing the leading slash if present)
      urlParts.pathname = `/${dbName}`;
      uri = urlParts.toString();
    }

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
