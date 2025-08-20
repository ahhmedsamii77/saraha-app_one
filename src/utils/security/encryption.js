import CryptoJS from "crypto-js";
export async function encryption({plaintext , key}){ 
  return CryptoJS.AES.encrypt(plaintext, key).toString();
}