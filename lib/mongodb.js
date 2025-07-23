// lib/mongodb.js

import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Obtenir le chemin absolu du dossier courant
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Charger les variables d’environnement depuis .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Récupération de l'URI MongoDB
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Veuillez définir la variable MONGODB_URI dans .env.local");
}

// Options de connexion (optionnel pour l’instant)
const options = {};

// Initialisation du client MongoDB
let client;
let clientPromise;

// Utiliser un cache global pour éviter les reconnections en développement
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

// Exporter la promesse de connexion
export default clientPromise;
