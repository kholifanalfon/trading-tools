import crypto from "node:crypto";
import { config } from "@/core/config";

const ALGORITHM = "aes-256-cbc";
// Derive a 32-byte key from the JWT secret using SHA-256
const SECRET_KEY = crypto.createHash("sha256").update(config.BE_JWT_SECRET).digest();

export function encrypt(text: string): string {
  if (!text) return "";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(text: string): string {
  if (!text) return "";
  const [ivHex, encryptedHex] = text.split(":");
  if (!ivHex || !encryptedHex) {
    throw new Error("Invalid encrypted text format");
  }
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
