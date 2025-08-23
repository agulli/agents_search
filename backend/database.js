// backend/database.js
// backend/database.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_FILE = 'ai_agents.db';
const db = new sqlite3.Database(DB_FILE);

const initDb = () => {
  db.serialize(() => {
    // Create the agents table with the new stars and forks columns
    db.run(`
      CREATE TABLE IF NOT EXISTS agents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT,
        source_type TEXT,
        category TEXT,
        description TEXT,
        links TEXT,
        stars INTEGER,
        forks INTEGER
      )
    `);

    // Check if the table is empty before populating
    db.get("SELECT COUNT(*) as count FROM agents", (err, row) => {
      if (err) {
        console.error("Error checking agent count:", err.message);
        return;
      }
      if (row.count === 0) {
        console.log("Database is empty. Populating with enriched data...");
        populateDb();
      } else {
        console.log("Database already populated.");
      }
    });
  });
};

const populateDb = () => {
  const jsonPath = path.join(__dirname, 'agents.json'); // Still reads from agents.json
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const agents = jsonData.ai_agents;

  const stmt = db.prepare(`
    INSERT INTO agents (name, url, source_type, category, description, links, stars, forks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.run('BEGIN TRANSACTION');
  agents.forEach(agent => {
    stmt.run(
      agent.name,
      agent.url,
      agent.source_type,
      JSON.stringify(agent.category),
      agent.description,
      JSON.stringify(agent.links),
      agent.stars, // Add stars
      agent.forks  // Add forks
    );
  });
  stmt.finalize();
  db.run('COMMIT', (err) => {
    if (err) {
      console.error("Error committing transaction:", err.message);
    } else {
      console.log("Successfully populated the database with enriched data.");
    }
  });
};

module.exports = { db, initDb };