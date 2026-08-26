import mongoose from "mongoose";

const cached = (global as any).mongoose || { conn: null, promise: null };

if (!(global as any).mongoose) {
	(global as any).mongoose = cached;
}

export async function connectToDatabase() {
	if (cached.conn) return cached.conn;

	if (!cached.promise) {
		const MONGODB_URI = process.env.MONGODB_URI;
		cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
	}

	cached.conn = await cached.promise;
	return cached.conn;
}

