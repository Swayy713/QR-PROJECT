import Database from "better-sqlite3";

const db = new Database("./product.db");
console.log("Connected to the SQLite database.");

export const query = (text, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      // If the query is a SELECT, use stmt.all() (returns data)
      if (text.trim().toUpperCase().startsWith("SELECT")) {
        const stmt = db.prepare(text);
        const rows = stmt.all(...params);
        resolve({ rows }); // Return in { rows } format to match your old code
      }
      // If the query is INSERT/UPDATE, use stmt.run() (returns nothing)
      else {
        const stmt = db.prepare(text);
        const info = stmt.run(...params);
        // 'info' contains info like lastInsertRowid and changes
        resolve({ rows: [], lastID: info.lastInsertRowid, changes: info.changes });
      }
    } catch (err) {
      reject(err);
    }
  });
};

export default db;
