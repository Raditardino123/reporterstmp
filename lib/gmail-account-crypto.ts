import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const algorithm = "aes-256-gcm";

function getEncryptionKey() {
  const encodedKey = process.env.GMAIL_CREDENTIALS_ENCRYPTION_KEY;
  if (!encodedKey) {
    throw new Error("GMAIL_CREDENTIALS_ENCRYPTION_KEY is not configured.");
  }

  const key = Buffer.from(encodedKey, "base64");
  if (key.length !== 32 || key.toString("base64") !== encodedKey) {
    throw new Error(
      "GMAIL_CREDENTIALS_ENCRYPTION_KEY must be a base64-encoded 32-byte key.",
    );
  }

  return key;
}

export function encryptGmailAppPassword(password: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(password, "utf8"),
    cipher.final(),
  ]);

  return [
    "v1",
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

export function decryptGmailAppPassword(encryptedValue: string) {
  const [version, encodedIv, encodedTag, encodedData, ...extra] =
    encryptedValue.split(".");
  if (
    version !== "v1" ||
    !encodedIv ||
    !encodedTag ||
    !encodedData ||
    extra.length > 0
  ) {
    throw new Error("Stored Gmail app password has an invalid format.");
  }

  const decipher = createDecipheriv(
    algorithm,
    getEncryptionKey(),
    Buffer.from(encodedIv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(encodedTag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encodedData, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
