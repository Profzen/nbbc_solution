// pages/api/admin/transactions.js
import { connectToDatabase } from "../../../lib/mongodb";
import Transaction from "../../../models/Transaction";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  try {
    // 1) Connexion à MongoDB
    await connectToDatabase();

    // 2) Récupère jusqu'à 100 transactions, triées par date décroissante
    const docs = await Transaction.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // 3) Convertit _id et formatte la date
    const data = docs.map(tx => ({
      ...tx,
      _id: tx._id.toString(),
      createdAt: tx.createdAt.toISOString(), // ou .split('T')[0] si tu veux juste la date
    }));

    // 4) Envoie la réponse
    res.status(200).json(data);
  } catch (err) {
    console.error("Erreur récupération transactions :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
}
