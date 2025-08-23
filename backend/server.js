// backend/server.js
const express = require('express');
const cors = require('cors');
const { db, initDb } = require('./database');

const app = express();
const PORT = 3001;

// Initialize Database
initDb();

app.use(cors());

// API Endpoint to get agents with filtering and search
app.get('/api/agents', (req, res) => {
  const { q, category, source_type } = req.query;

  let sql = 'SELECT * FROM agents WHERE 1=1';
  const params = [];

  // Full-text search on name and description
  if (q) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  // Filter by category (searches within the JSON array string)
  if (category) {
    sql += ' AND category LIKE ?';
    params.push(`%${category}%`);
  }
  
  // Filter by source type
  if (source_type) {
    sql += ' AND source_type = ?';
    params.push(source_type);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Parse the JSON strings back into objects/arrays before sending
    const results = rows.map(row => ({
      ...row,
      category: JSON.parse(row.category || '[]'),
      links: JSON.parse(row.links || '{}'),
    }));
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});