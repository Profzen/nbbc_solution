// pages/api/rates.js
import { connectToDatabase } from "../../lib/mongodb";
import Rate from "../../models/rate";

const defaultRates = {
  BTC: 60000,
  ETH: 3000,
  USDT: 1,
  USD: 1,
  EUR: 1.1,
  XOF: 0.0017,
};

export default async function handler(req, res) {
  try {
    await connectToDatabase();

    let rateDoc = await Rate.findOne().sort({ updatedAt: -1 });

    // Si aucun taux trouvé, on insère les valeurs par défaut
    if (!rateDoc) {
      console.log("Aucun taux trouvé. Insertion des taux par défaut.");
      rateDoc = await Rate.create({ rates: defaultRates, updatedAt: new Date() });
    }

    // Pas besoin de Object.fromEntries car c’est déjà un objet
    return res.status(200).json({ rates: rateDoc.rates });

  } catch (error) {
    console.error("Erreur API rates:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}
