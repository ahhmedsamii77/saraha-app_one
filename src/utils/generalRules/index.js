import joi from "joi";
import mongoose from "mongoose";

function customId(value, helpers) {
  const data = mongoose.Types.ObjectId.isValid(value);
  return data ? value : helpers.message("Invalid id");
}

export const generalRules = {
  email: joi.string().email(),
  password: joi.string().required().min(6),
  id: joi.string().custom(customId)
}