// models/Rate.js
import { Schema, model, models } from "mongoose";

const RateSchema = new Schema({
  currency: { type: String, unique: true },
  value:    { type: Number, required: true },
});

export default models.Rate || model("Rate", RateSchema);
