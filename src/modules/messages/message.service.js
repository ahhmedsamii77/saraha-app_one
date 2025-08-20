import { messageModel, userModel } from "../../DB/models/index.js"

// create message
export async function createMessage(req, res, next) {
  const { userId, content } = req.body;
  const user = await userModel.findById(userId);
  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }
  const msg = await messageModel.create({ userId, content });
  return res.status(201).json({ message: "message created successfully", msg });
}

// get all messages
export async function getAllMessages(req, res, next) {
  const messages = await messageModel.find({ userId: req.user._id }).populate([
    {
      path: "userId",
    }
  ]);
  return res.status(200).json({ message: "messages", messages });
}

// get message
export async function getMessage(req, res, next) {
  const { messageId } = req.params;
  const msg = await messageModel.findOne({ _id: messageId, userId: req.user._id }).populate([
    {
      path: "userId",
    }
  ]);
  if (!msg) {
    throw new Error("message not found", { cause: 404 });
  }
  return res.status(200).json({ message: "message", msg });
}