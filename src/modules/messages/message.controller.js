import { Router } from "express";
import { authentication, validation } from "../../middleware/index.js";
import * as MS from "./message.service.js";
import * as MV from "./message.validation.js";

export const messageRouter = Router();

// create message
messageRouter.post("/create", validation(MV.createMessageSchema), MS.createMessage);

// get all messages
messageRouter.get("/", authentication, MS.getAllMessages);


// get message 
messageRouter.get("/:messageId", authentication, MS.getMessage);