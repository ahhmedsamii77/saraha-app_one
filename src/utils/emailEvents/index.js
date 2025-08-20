import { EventEmitter } from "node:events";
import { sendEmail } from "../../service/sendEmail.js";
import { hash } from "../index.js"
import { otpModel } from "../../DB/models/otp.model.js";
import { customAlphabet, nanoid } from "nanoid";
import { userModel } from "../../DB/models/index.js";

export const eventEmitter = new EventEmitter();

eventEmitter.on("confirmEmail", async (data) => {
  const { email, userId } = data;
  const otp = nanoid(4);
  const hashOtp = await hash({ plaintext: otp });
  const newOtp = await otpModel.create({ userId, code: hashOtp, expireAt: Date.now() + 5 * 60 * 1000 });
  const isSend = await sendEmail({ to: email, subject: "confirm email", html: `<h1>your otp is ${otp}</h1>` });
  if (!isSend) {
    throw new Error("fail to send email", { cause: 500 });
  }
});


eventEmitter.on("forgetPassword", async (data) => {
  const { email, otp } = data;
  const isSend = await sendEmail({ to: email, subject: "forget password", html: `<h1>your otp is ${otp}</h1>` });
  if (!isSend) {
    throw new Error("fail to send email", { cause: 500 });
  }
});