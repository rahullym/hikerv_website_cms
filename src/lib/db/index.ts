import mongoose from 'mongoose';

// Cache the connection across hot reloads in dev and across Vercel function
// invocations (where the module is reused between requests). Without this the
// build would open a new pool on every page that imports a model.
type Cached = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalScope = globalThis as unknown as { __mongooseCache?: Cached };
const cached: Cached = globalScope.__mongooseCache ?? { conn: null, promise: null };
globalScope.__mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  const uri = import.meta.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Add it to your .env file (see .env.example).'
    );
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export { mongoose };
