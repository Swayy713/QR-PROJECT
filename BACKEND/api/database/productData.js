import db from "../config/db.js";

export const initDb = () => {
  return new Promise((resolve, reject) => {
    try {
      db.pragma("foreign_keys = ON");

      //SQlite table creation query
      const sql = `
        CREATE TABLE IF NOT EXISTS products (
          product_id TEXT PRIMARY KEY,
          nonce TEXT NOT NULL,
          product_data TEXT NOT NULL, -- Stores JSON string
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `;

      // SQLite allows executing multiple statements if using db.exec synchronously
      db.exec(sql);
      console.log("✅ Tables 'products' and 'mock_blockchain' are ready.");
      resolve();
    } catch (err) {
      console.error("❌ Error creating tables:", err.message);
      reject(err);
    }
  });
};
