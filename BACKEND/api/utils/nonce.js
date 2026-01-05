import crypto from "crypto";

function generateNonce(length) {
  return crypto.randomBytes(length).toString("hex");
}

export default generateNonce;
