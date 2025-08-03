// pages/api/send-transaction-email.js

import nodemailer from "nodemailer";
import formidable from "formidable";
import fs from "fs";
import { connectToDatabase } from "../../lib/mongodb";
import Transaction from "../../models/Transaction";

export const config = { api: { bodyParser: false } };

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      maxFileSize: 5*1024*1024,
      filter: ({ mimetype }) => [
        "application/pdf","application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg","image/png","image/gif","image/bmp","image/webp"
      ].includes(mimetype||""),
    });
    form.parse(req,(err,fields,files)=>{
      if(err) return reject(err);
      resolve({ fields, files });
    });
  });
}

function norm(f){ return Array.isArray(f)?f[0]:f; }

export default async function handler(req,res){
  if(req.method!=="POST"){
    return res.status(405).json({ message:"Méthode non autorisée" });
  }
  try{
    const { fields, files } = await parseForm(req);
    // normalisation
    const amount          = norm(fields.amount);
    const from            = norm(fields.from);
    const to              = norm(fields.to);
    const converted       = norm(fields.converted);
    const firstName       = norm(fields.firstName);
    const lastName        = norm(fields.lastName);
    const phone           = norm(fields.phone);
    const email           = norm(fields.email);
    const country         = norm(fields.country);
    const paymentMethod   = norm(fields.paymentMethod);
    const paymentDetails  = norm(fields.paymentDetails);
    const receiveMethod   = norm(fields.receiveMethod);
    const receiveDetails  = norm(fields.receiveDetails);
    const address         = norm(fields.address);

    // attachement preuve
    const attachments = [];
    let proofFilename = null;
    let proof = files.proof;
    if(Array.isArray(proof)) proof = proof[0];
    if(proof && (proof.filepath||proof.path)){
      const tmp = proof.filepath||proof.path;
      const name = Date.now()+"-"+(proof.originalFilename||"preuve");
      const content = fs.readFileSync(tmp);
      attachments.push({ filename:name, content });
      proofFilename = name;
    }

    // SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE==="true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Mongo + insertion
    await connectToDatabase();
    const tx = await Transaction.create({
      firstName, lastName, email, phone, country,
      from, to, amount:+amount, converted:+converted,
      paymentMethod, paymentDetails,
      receiveMethod: receiveMethod||null,
      receiveDetails: receiveDetails||null,
      address: address||null,
      proofFilename, status:"en attente"
    });

    const txId = tx._id.toString();

    // emails
    const baseInfo = `
• Montant      : ${amount} ${from}
• Équivalent   : ${converted} ${to}
• Pays         : ${country}
• Téléphone    : ${phone}
• Moyen paiement : ${paymentMethod || "-"}
• Détails paiement: ${paymentDetails || "-"}
${receiveMethod? `• Moyen réception : ${receiveMethod}` : ""}
${receiveDetails? `• Détails réception: ${receiveDetails}` : ""}
${address? `• Adresse crypto   : ${address}` : ""}
`;

    const clientMail = {
      from: `"Nexchang" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Votre conversion ${from}→${to} est en cours`,
      text: `
Bonjour ${firstName} ${lastName},

Nous avons bien reçu votre demande de conversion.

${baseInfo}
✅ ID transaction : ${txId}
📌 Statut         : en attente

Merci pour votre confiance !
      `,
      attachments,
    };
    const adminMail = {
      from: `"Nexchang" <${process.env.SMTP_USER}>`,
      to: "NEWBOSSBUSINESSCENTER@GMAIL.COM",
      subject: `🔔 Nouvelle commande : ${from}→${to}`,
      text: `
Nouvelle commande :

Client  : ${firstName} ${lastName} (${email}, ${phone}), ${country}
Transaction :
${baseInfo}
Statut : en attente
Preuve jointe si présente.
      `,
      attachments,
    };

    await transporter.sendMail(clientMail);
    await transporter.sendMail(adminMail);

    return res.status(200).json({ message:"OK", id:txId });

  } catch(err){
    console.error("Erreur API send-transaction-email :",err);
    if(err.code==="LIMIT_FILE_SIZE"){
      return res.status(400).json({ message:"Fichier trop lourd (max 5Mo)" });
    }
    return res.status(500).json({ message:"Erreur serveur" });
  }
}




// pages/api/send-sms.js
import { connectToDatabase } from "../../lib/mongodb";
import Transaction from "../../models/Transaction";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const {
    transactionId,
    firstName,
    lastName,
    email,
    phone,
    country,
    from,
    to,
    amount,
    converted,
    status,
  } = req.body;

  if (!transactionId) {
    return res.status(400).json({ message: "ID transaction manquant" });
  }

  // Construire le message
  const msg = `
Commande ${transactionId} :
Client: ${firstName} ${lastName}
Email: ${email}
Tel: ${phone}
Pays: ${country}
De → Vers: ${from} → ${to}
Montant: ${amount} ${from}
Équivalent: ${converted} ${to}
Statut: ${status}
  `.trim();

  const kingBase = process.env.KINGSMS_API_BASE?.replace(/\/+$/,"");
  if (!kingBase || !process.env.KINGSMS_APIKEY || !process.env.KINGSMS_CLIENTID || !process.env.ADMIN_SMS_NUMBER) {
    return res.status(500).json({ message: "Configuration SMS incomplète" });
  }

  const endpoint = `${kingBase}/sms/send`;

  try {
    // Optionnel : persister ou vérifier transaction (connexion)
    await connectToDatabase();
    // On pourrait récupérer la transaction pour valider, mais on assume que les données sont correctes.

    const payload = {
      from: process.env.SMS_SENDER || "Nexchang",
      to: process.env.ADMIN_SMS_NUMBER,
      message: msg,
      type: 0,
      dlr: "yes",
      // url: "https://ton-site.com/webhook/dlr" // si tu veux recevoir accusé
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        APIKEY: process.env.KINGSMS_APIKEY,
        CLIENTID: process.env.KINGSMS_CLIENTID,
      },
      body: JSON.stringify(payload),
    });

    // King SMS Pro retourne parfois HTML si URL incorrecte ; on essaye de parser en JSON en sécurisant
    let result;
    const text = await response.text();
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.warn("Réponse non JSON reçue de King SMS Pro :", text.slice(0, 300));
      return res.status(502).json({ message: "Réponse inattendue de King SMS Pro", raw: text });
    }

    if (!response.ok) {
      return res.status(502).json({ message: "Erreur de King SMS Pro", detail: result });
    }

    return res.status(200).json({ message: "SMS envoyé", kingResponse: result });
  } catch (err) {
    console.error("Erreur send-sms:", err);
    return res.status(500).json({ message: "Erreur interne send-sms", error: err.message });
  }
}



// ENVOI SMS À L'ADMIN
    try {
      const smsMessage = `
Nouvelle conversion reçue :
ID : ${txId}
Client : ${firstName} ${lastName}
Email : ${email}
Téléphone : ${phone}
Pays : ${country}
De → Vers : ${from} → ${to}
Montant : ${amount} ${from}
Équivalent : ${converted} ${to}
Statut : en attente
`;

      // Utilise BASE_URL pour former l'URL interne
      const base = process.env.BASE_URL || "http://localhost:3000";
      await fetch(`${base.replace(/\/+$/, "")}/api/send-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: process.env.ADMIN_SMS_NUMBER,
          message: smsMessage,
        }),
      });
    } catch (smsErr) {
      console.error("Erreur envoi SMS admin :", smsErr);
    }

    return res.status(200).json({ message: "OK", id: txId });
  } catch (err) {
    console.error("Erreur API send-transaction-email :", err);
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Fichier trop lourd (max 5Mo)" });
    }
    return res.status(500).json({ message: "Erreur serveur" });
  }