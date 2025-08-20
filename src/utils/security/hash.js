import bcrypt from "bcrypt";
export async function hash({ plaintext }) {
  return bcrypt.hashSync(plaintext, Number(process.env.SALT));
}