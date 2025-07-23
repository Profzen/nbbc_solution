// scripts/initRates.cjs
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Veuillez définir la variable MONGODB_URI dans .env.local");
}

const client = new MongoClient(uri);

async function initRates() {
  try {
    await client.connect();
    const db = client.db(); // nom de la base défini dans l'URI
    const ratesCollection = db.collection("exchangeRates");

    const defaultRates = [
      { from: "BTC", to: "XOF", rate: 42000000 },
      { from: "ETH", to: "XOF", rate: 2600000 },
      { from: "USDT", to: "XOF", rate: 990 },
    ];

    for (const rate of defaultRates) {
      await ratesCollection.updateOne(
        { from: rate.from, to: rate.to },
        { $set: { rate: rate.rate } },
        { upsert: true }
      );
    }

    console.log("Taux de change initialisés avec succès !");
  } catch (err) {
    console.error("Erreur lors de l'initialisation :", err);
  } finally {
    await client.close();
  }
}

initRates();
