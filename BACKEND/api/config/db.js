import sqlite3 from "sqlite3";

const db = new sqlite3.Database(
  "./product.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) return console.error(err.message);
    console.log("Connected to the SQLite database.");
  },
);

export const query = (text, params = []) => {
  return new Promise((resolve, reject) => {
    // If the query is a SELECT, use db.all() (returns data)
    if (text.trim().toUpperCase().startsWith("SELECT")) {
      db.all(text, params, (err, rows) => {
        if (err) return reject(err);
        resolve({ rows }); // Return in { rows } format to match your old code
      });
    }
    // If the query is INSERT/UPDATE, use db.run() (returns nothing)
    else {
      db.run(text, params, function (err) {
        if (err) return reject(err);
        // 'this' contains info like lastID and changes
        resolve({ rows: [], lastID: this.lastID, changes: this.changes });
      });
    }
  });
};

export default db;
