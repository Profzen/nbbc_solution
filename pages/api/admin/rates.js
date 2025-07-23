// pages/api/admin/rates.js
import { parse } from "cookie";
import { connectToDatabase } from "../../../lib/mongodb";
import Rate from "/models/rate";

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || "");
  let auth;
  try { auth = JSON.parse(cookies.auth || "{}"); } catch { auth = null; }
  if (!auth || auth.user !== process.env.ADMIN_USER) {
    return res.status(401).json({ error: "Non autorisé" });
  }

  await connectToDatabase();

  if (req.method === "GET") {
    const docs = await Rate.find({});
    const rates = docs.reduce((acc, { currency, value }) => {
      acc[currency] = value;
      return acc;
    }, {});
    return res.status(200).json({ rates });
  }

  if (req.method === "POST") {
    const { rates } = req.body;
    // on upsert chaque taux
    for (const [currency, value] of Object.entries(rates)) {
      await Rate.updateOne(
        { currency },
        { currency, value },
        { upsert: true }
      );
    }
    return res.status(200).json({ message: "Taux mis à jour" });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end();
}
