import mongoose from "mongoose";
import { config } from "dotenv";
config();

const MONGODB_URI = process.env.MONGODB_URI;

const transactionSchema = new mongoose.Schema({
  firstName: String,
  email: String,
  createdAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema, "transactions");

(async () => {
  await mongoose.connect(MONGODB_URI);
  const newTx = await Transaction.create({ firstName: "Test", email: "test@test.com" });
  console.log("✅ Insertion OK :", newTx._id);
  process.exit();
})();
