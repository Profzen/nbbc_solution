// models/ExchangeRate.js
import mongoose from "mongoose";

const exchangeRateSchema = new mongoose.Schema({
  _id: { type: String, default: "default" },
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

export default mongoose.models.ExchangeRate ||
  mongoose.model("ExchangeRate", exchangeRateSchema, "exchange_rates");
