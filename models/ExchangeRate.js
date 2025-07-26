// models/ExchangeRate.js
import mongoose from "mongoose";

const ExchangeRateSchema = new mongoose.Schema({
  rates: {
    type: Map,
    of: Number,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.ExchangeRate || mongoose.model("ExchangeRate", ExchangeRateSchema);
