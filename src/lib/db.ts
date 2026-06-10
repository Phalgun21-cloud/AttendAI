import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendai';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null, isMock: false };
}

async function dbConnect() {
  if (process.env.USE_MOCK_DB === 'true') {
    cached.isMock = true;
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (cached.isMock) {
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("Connected to MongoDB successfully.");
        return mongooseInstance;
      })
      .catch((err) => {
        console.warn("MongoDB connection failed, falling back to in-memory mock database:", err.message);
        cached.isMock = true;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
    if (cached.conn === null) {
      cached.isMock = true;
    }
  } catch (e: any) {
    cached.promise = null;
    cached.isMock = true;
    console.warn("MongoDB connection threw error, falling back to in-memory mock database:", e.message);
  }

  return cached.conn;
}

export function isMockDb() {
  if (process.env.USE_MOCK_DB === 'true') return true;
  return (global as any).mongoose?.isMock || false;
}

export default dbConnect;
