// pages/api/rates.js
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), "data", "rates.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const rates = JSON.parse(raw);
  return res.status(200).json({ rates });
}
