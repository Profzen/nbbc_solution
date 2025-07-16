// lib/mongodb.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI; 
// Exemple de valeur : mongodb+srv://user:pass@cluster0.mongodb.net/crypto?retryWrites=true&w=majority

if (!MONGODB_URI) {
  throw new Error("Veuillez définir la variable MONGODB_URI dans .env.local");
}

// Cache de connexion pour éviter de créer plusieurs connexions en dev
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
