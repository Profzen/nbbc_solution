// pages/api/admin/update-rates.js
import { connectToDatabase } from "../../../lib/mongodb";
import Rate from "../../../models/rate";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const rates = req.body;

  // Validation simple
  if (!rates || typeof rates !== "object") {
    return res.status(400).json({ message: "Format des taux invalide" });
  }

  try {
    await connectToDatabase();

    // Supprimer tous les anciens taux (on part du principe qu’il n’y en a qu’un seul)
    await Rate.deleteMany({});

    // Créer un nouveau document avec les nouveaux taux
    const newRate = new Rate({ rates: Object.entries(rates) });
    await newRate.save();

    res.status(200).json({ message: "Taux mis à jour avec succès" });
  } catch (err) {
    console.error("Erreur mise à jour taux :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
}
