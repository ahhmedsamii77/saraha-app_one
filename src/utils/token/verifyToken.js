import jwt from "jsonwebtoken";
export async function verifyToken({ token, signature }) {
  return jwt.verify(token, signature);
}