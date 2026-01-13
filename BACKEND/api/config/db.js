import pkg from "pg";
import { config } from "./config.js";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: {
    rejectUnauthorized: false, // Required for Neon secure connection
  },
});

// A helper function to run queries
export const query = (text, params) => pool.query(text, params);

export const testConnection = async () => {
  // A simple query to check if the door is open
  await pool.query("SELECT NOW()");
};
