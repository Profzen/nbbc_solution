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
      to: "profzzen@gmail.com",
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
