// pages/api/admin/rates.js
import fs from "fs";
import path from "path";
import { parse } from "cookie";

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

  const filePath = path.join(process.cwd(), "data", "rates.json");

  if (req.method === "GET") {
    const raw = fs.readFileSync(filePath, "utf-8");
    const rates = JSON.parse(raw);
    return res.status(200).json({ rates });
  }

  if (req.method === "POST") {
    const { rates } = req.body;
    fs.writeFileSync(filePath, JSON.stringify(rates, null, 2), "utf-8");
    return res.status(200).json({ message: "Taux mis à jour" });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Méthode ${req.method} non autorisée`);
}
