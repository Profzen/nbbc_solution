// pages/api/send-confirmation-email.js

import nodemailer from "nodemailer";
import { connectToDatabase } from "../../lib/mongodb";
import Transaction from "../../models/Transaction";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { id } = req.body;
  if (!id) return res.status(400).json({ message: "ID manquant" });

  try {
    await connectToDatabase();

    const tx = await Transaction.findById(id);
    if (!tx) return res.status(404).json({ message: "Transaction non trouvée" });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const txId = tx._id.toString();
    const baseInfo = `
• Montant      : ${tx.amount} ${tx.from}
• Équivalent   : ${tx.converted} ${tx.to}
• Pays         : ${tx.country}
• Téléphone    : ${tx.phone}
• Moyen paiement : ${tx.paymentMethod || "-"}
• Détails paiement: ${tx.paymentDetails || "-"}
${tx.receiveMethod ? `• Moyen réception : ${tx.receiveMethod}` : ""}
${tx.receiveDetails ? `• Détails réception: ${tx.receiveDetails}` : ""}
${tx.address ? `• Adresse crypto   : ${tx.address}` : ""}
    `;

    await transporter.sendMail({
      from: `"Nexchang" <${process.env.SMTP_USER}>`,
      to: tx.email,
      subject: `Votre transaction ${tx.from}→${tx.to} est validée ✅`,
      text: `
Bonjour ${tx.firstName} ${tx.lastName},

Votre transaction a été traitée avec succès !

${baseInfo}
✅ ID transaction : ${txId}
📌 Statut         : validé

Merci pour votre confiance et à bientôt sur Nexchang.
      `,
    });

    res.status(200).json({ message: "Email de confirmation envoyé" });
  } catch (err) {
    console.error("Erreur envoi confirmation :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
}
