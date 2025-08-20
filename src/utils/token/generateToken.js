import jwt from "jsonwebtoken";
export async function generateToken({ payload, signature, options }) {
  return jwt.sign(payload, signature, options);
}