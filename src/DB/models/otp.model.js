import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  expireAt: {
    type: Date,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});


export const otpModel = mongoose.models.otps || mongoose.model("otps", otpSchema);