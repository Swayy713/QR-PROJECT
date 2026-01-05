import { ethers } from "ethers";

function hashData(productId, nonce) {
  return ethers.solidityPackedKeccak256(
    ["string", "string"],
    [productId, nonce]
  );
}

export default hashData;