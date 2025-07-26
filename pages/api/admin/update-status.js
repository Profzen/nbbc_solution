import { connectToDatabase } from "../../../lib/mongodb";
import Transaction from "../../../models/Transaction";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { id, status } = req.body;

  if (!id || !["en attente", "validé"].includes(status)) {
    return res.status(400).json({ message: "Paramètres invalides" });
  }

  try {
    await connectToDatabase();
    const result = await Transaction.findByIdAndUpdate(id, { status });

    if (!result) {
      return res.status(404).json({ message: "Transaction introuvable" });
    }

    res.status(200).json({ message: "Statut mis à jour" });
  } catch (err) {
    console.error("Erreur update status :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
}