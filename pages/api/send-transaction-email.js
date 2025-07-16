// pages/api/send-transaction-email.js

import nodemailer from "nodemailer";
import formidable from "formidable";
import fs from "fs";
import path from "path";

// Import de la connexion et du modèle
import { connectToDatabase } from "../../lib/mongodb";
import Transaction from "../../models/Transaction";

// Désactive le parsing par défaut de Next.js pour gérer FormData
export const config = { api: { bodyParser: false } };

/**
 * Parse la requête multipart/form-data avec Formidable.
 */
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      maxFileSize: 5 * 1024 * 1024, // 5 Mo
      filter: ({ mimetype }) => {
        const allowed = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/bmp",
          "image/webp",
        ];
        return allowed.includes(mimetype || "");
      },
    });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

/** Normalise un champ qui peut venir sous forme de tableau */
function norm(field) {
  return Array.isArray(field) ? field[0] : field;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  try {
    // 1️⃣ On parse
    const { fields, files } = await parseForm(req);

    // 2️⃣ On normalise
    const amount         = norm(fields.amount);
    const from           = norm(fields.from);
    const to             = norm(fields.to);
    const converted      = norm(fields.converted);
    const firstName      = norm(fields.firstName);
    const lastName       = norm(fields.lastName);
    const phone          = norm(fields.phone);
    const email          = norm(fields.email);
    const country        = norm(fields.country);
    const paymentMethod  = norm(fields.paymentMethod);
    const paymentDetails = norm(fields.paymentDetails);
    const address        = norm(fields.address);

    // 3️⃣ Préparation de l’attachement
    const attachments = [];
    let proofFilename = null;
    let proofFile     = files.proof;
    if (Array.isArray(proofFile)) proofFile = proofFile[0];

    if (proofFile && (proofFile.filepath || proofFile.path)) {
      try {
        const tmpPath = proofFile.filepath || proofFile.path;
        const fileName =
          Date.now() +
          "-" +
          (proofFile.originalFilename || "preuve");
        const fileContent = fs.readFileSync(tmpPath);

        attachments.push({ filename: fileName, content: fileContent });
        proofFilename = fileName;
      } catch (e) {
        console.warn("⚠️  Impossible de lire le fichier de preuve :", e);
      }
    }

    // 4️⃣ Connexion SMTP
    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 5️⃣ Connexion MongoDB + insertion
    await connectToDatabase();
    const transaction = await Transaction.create({
      firstName,
      lastName,
      email,
      phone,
      country,
      from,
      to,
      amount:         Number(amount),
      converted:      Number(converted),
      paymentMethod:  paymentMethod  || null,
      paymentDetails: paymentDetails || null,
      address:        address        || null,
      proofFilename,           // on sauve juste le nom
      status:         "en attente",
    });

    const txId = transaction._id.toString();

    // 6️⃣ Préparation des e‑mails
    const clientMail = {
      from:    `"CryptoFiat" <${process.env.SMTP_USER}>`,
      to:      email,
      subject: `Votre conversion ${from} → ${to} est en cours`,
      text: `
Bonjour ${firstName} ${lastName},

Nous avons bien reçu votre demande de conversion.

• Montant : ${amount} ${from}
• Équivalent : ${converted} ${to}
• Pays : ${country}
• Téléphone : ${phone}
${paymentMethod  ? `• Moyen de paiement : ${paymentMethod}`   : ""}
${paymentDetails ? `• Détails paiement : ${paymentDetails}` : ""}
${address        ? `• Adresse de réception : ${address}`   : ""}

Votre ID de transaction est : ${txId}

Merci pour votre confiance !
      `,
      attachments,
    };

    const adminMail = {
      from:    `"CryptoFiat" <${process.env.SMTP_USER}>`,
      to:      "profzzen@gmail.com",
      subject: `🔔 Nouvelle commande : ${from} → ${to}`,
      text: `
Nouvelle commande enregistrée :

Client :
- ${firstName} ${lastName}
- Email : ${email}
- Téléphone : ${phone}
- Pays : ${country}

Transaction :
- ID : ${txId}
- Montant : ${amount} ${from}
- Équivalent : ${converted} ${to}
${paymentMethod  ? `- Moyen de paiement : ${paymentMethod}`   : ""}
${paymentDetails ? `- Détails paiement : ${paymentDetails}` : ""}
${address        ? `- Adresse : ${address}`               : ""}

Statut : en attente
Preuve jointe si présente.
      `,
      attachments,
    };

    // 7️⃣ Envoi
    await transporter.sendMail(clientMail);
    await transporter.sendMail(adminMail);

    // 8️⃣ OK
    return res
      .status(200)
      .json({ message: "E‑mails envoyés et transaction enregistrée", id: txId });

  } catch (error) {
    console.error("Erreur API send-transaction-email :", error);
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Le fichier est trop lourd (max 5 Mo)." });
    }
    if (error.message?.includes("filter")) {
      return res.status(400).json({
        message:
          "Type de fichier non autorisé. Seuls PDF, Word ou images sont acceptés.",
      });
    }
    return res
      .status(500)
      .json({ message: "Erreur interne lors de l'envoi d’e‑mail." });
  }
}
