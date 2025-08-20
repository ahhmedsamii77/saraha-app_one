import cryptoJS from "crypto-js";
export async function decryption({ ciphertext, key }) {
  return cryptoJS.AES.decrypt(ciphertext, key).toString(cryptoJS.enc.Utf8);
}