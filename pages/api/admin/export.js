// pages/api/admin/export.js

import { connectToDatabase } from "../../../lib/mongodb";
import Transaction            from "../../../models/Transaction";
import { Parser as Json2csvParser } from "json2csv";
import PDFDocument            from "pdfkit";

export default async function handler(req, res) {
  // Auth SSR déjà gérée côté page Admin
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  // Lecture des filtres en query params
  const { format = "csv", status, dateFrom, dateTo } = req.query;

  await connectToDatabase();

  // Construction du filtre Mongo
  const mongoFilter = {};
  if (status && status !== "all") mongoFilter.status = status;
  if (dateFrom || dateTo) {
    mongoFilter.createdAt = {};
    if (dateFrom) mongoFilter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) {
      const d = new Date(dateTo);
      d.setHours(23, 59, 59, 999);
      mongoFilter.createdAt.$lte = d;
    }
  }

  const docs = await Transaction.find(mongoFilter).sort({ createdAt: -1 }).lean();

  if (format === "pdf") {
    // --- PDF Generation ---
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="transactions_${Date.now()}.pdf"`
    );

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    doc.pipe(res);

    doc.fontSize(18).text("Export Transactions", { align: "center" });
    doc.moveDown();

    // Table header
    doc.fontSize(10).text(
      "Date       | Client               | Montant → Éq.   | Statut",
      { continued: false }
    );
    doc.moveDown(0.5);

    docs.forEach(tx => {
      const date = tx.createdAt.toISOString().split("T")[0];
      const client = `${tx.firstName} ${tx.lastName}`;
      const mont = `${tx.amount} ${tx.from} → ${tx.converted} ${tx.to}`;
      doc.text(
        `${date} | ${client.padEnd(20)} | ${mont.padEnd(15)} | ${tx.status}`,
        { continued: false }
      );
    });

    doc.end();
  } else {
    // --- CSV Generation ---
    const fields = [
      "createdAt",
      "firstName",
      "lastName",
      "email",
      "from",
      "to",
      "amount",
      "converted",
      "status",
    ];
    const parser = new Json2csvParser({ fields });
    const csv = parser.parse(
      docs.map(tx => ({
        ...tx,
        createdAt: tx.createdAt.toISOString().split("T")[0],
      }))
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="transactions_${Date.now()}.csv"`
    );
    res.send(csv);
  }
}
