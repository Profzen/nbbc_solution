// pages/api/rates.js
import { connectToDatabase } from "../../lib/mongodb";
import Rate from "/models/rate";

export default async function handler(req, res) {
  await connectToDatabase();
  const docs = await Rate.find({});
  const rates = docs.reduce((acc, { currency, value }) => {
    acc[currency] = value;
    return acc;
  }, {});
  res.status(200).json({ rates });
}
