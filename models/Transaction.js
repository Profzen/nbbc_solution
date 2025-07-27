import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  country: String,
  from: String,
  to: String,
  amount: Number,
  converted: Number,
  paymentMethod: String,
  paymentDetails: String, // <-- Champ ajouté ici
  address: String,
  proofFilename: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
  type: String,
  enum: ["en attente", "validé"],
  default: "en attente",
},

}); 

// ⚠️ Important : spécifie la collection "transactions"
export default mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema, "transactions");