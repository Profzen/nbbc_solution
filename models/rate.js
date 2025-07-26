import mongoose from "mongoose";

const RateSchema = new mongoose.Schema({
  rates: {
    type: Map,
    of: Number,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Évite l'erreur "Cannot overwrite model" en vérifiant s'il existe déjà
export default mongoose.models.Rate || mongoose.model("Rate", RateSchema);
