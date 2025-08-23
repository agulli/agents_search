// frontend/src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';

const API_URL = 'http://localhost:3001/api/agents';

// A single card component for an agent
function AgentCard({ agent }) {
  return (
    <div className="agent-card">
      <h3>
        <a href={agent.url} target="_blank" rel="noopener noreferrer">
          {agent.name}
        </a>
      </h3>
      <p className="source-type">{agent.source_type}</p>
      <p>{agent.description}</p>
      <div className="categories">
        {agent.category.map((cat, index) => (
          <span key={index} className="category-tag">{cat}</span>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [agents, setAgents] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSourceType, setSelectedSourceType] = useState('');

  // Fetch all data initially to populate categories
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        const uniqueCategories = [...new Set(data.flatMap(agent => agent.category))];
        setAllCategories(uniqueCategories.sort());
      })
      .catch(error => console.error('Error fetching initial data:', error));
  }, []);

  // Fetch filtered data when filters change
  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.append('q', searchTerm);
    if (selectedCategory) queryParams.append('category', selectedCategory);
    if (selectedSourceType) queryParams.append('source_type', selectedSourceType);

    fetch(`${API_URL}?${queryParams.toString()}`)
      .then(res => res.json())
      .then(data => setAgents(data))
      .catch(error => console.error('Error fetching agents:', error));
  }, [searchTerm, selectedCategory, selectedSourceType]);

  return (
    <div className="app-container">
      <header>
        <h1>🔮 AI Agent Browser</h1>
        <p>Browse a curated database of AI agents, frameworks, and companies.</p>
      </header>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">All Categories</option>
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select value={selectedSourceType} onChange={(e) => setSelectedSourceType(e.target.value)}>
          <option value="">All Source Types</option>
          <option value="Open-source">Open-source</option>
          <option value="Closed-source">Closed-source</option>
        </select>
      </div>

      <div className="results-grid">
        {agents.length > 0 ? (
          agents.map(agent => <AgentCard key={agent.id} agent={agent} />)
        ) : (
          <p>No agents found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}

export default App;
