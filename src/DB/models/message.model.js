import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});


export const messageModel = mongoose.models.messages || mongoose.model("messages", messageSchema);