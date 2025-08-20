import joi from "joi";
import { generalRules } from "../../utils/index.js";

export const createMessageSchema = {
  body: joi.object({
    userId: generalRules.id.required(),
    content: joi.string().required()
  }).required()
}