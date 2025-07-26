// pages/api/admin/rates.js
import { parse } from "cookie";
import { connectToDatabase } from "../../../lib/mongodb";

import RateSchema from "../../../models/rate";

const defaultRates = {
  BTC: 60000,
  ETH: 3000,
  USDT: 1,
  USD: 1,
  EUR: 1.1,
  XOF: 0.0017,
};

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || "");
  let auth;

  try {
    auth = JSON.parse(cookies.auth || "{}");
  } catch {
    auth = null;
  }

  if (!auth || auth.user !== process.env.ADMIN_USER) {
    return res.status(401).json({ error: "Non autorisé" });
  }

  await connectToDatabase();

  if (req.method === "GET") {
  try {
    let latest = await RateSchema.findOne().sort({ updatedAt: -1 });

    if (!latest) {
      console.log("Aucun taux trouvé, insertion de defaultRates...");
      latest = await RateSchema.create({ rates: defaultRates });
    } else {
      console.log("Taux trouvés dans la base :", latest.rates);
    }
    
    console.log("Taux depuis la base (Map ?) :", latest.rates);
    console.log("Est-ce une Map ?", latest.rates instanceof Map);


    // Vérifie si latest.rates est bien une Map, sinon log le typeof
    console.log("Type de latest.rates :", typeof latest.rates);

    console.log("Envoi des taux :", Object.fromEntries(latest.rates));

    // On convertit toujours latest.rates en objet pour l'envoyer proprement
    return res.status(200).json({ rates: latest.rates });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur lors de la récupération des taux." });
  }
}


  if (req.method === "POST") {
    try {
      const { rates } = req.body;

      if (!rates || typeof rates !== "object") {
        return res.status(400).json({ error: "Données de taux invalides" });
      }

      await RateSchema.create({
        rates,
        updatedAt: new Date(),
      });

      console.log("Taux reçus et insérés :", rates);
      return res.status(200).json({ message: "Taux enregistrés avec succès." });
      

    } catch (error) {
      return res.status(500).json({ error: "Erreur lors de l'enregistrement des taux." });
      
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Méthode ${req.method} non autorisée`);
}
