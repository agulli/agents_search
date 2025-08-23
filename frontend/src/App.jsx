// frontend/src/App.jsx
// In frontend/src/App.jsx

import React, { useState, useEffect, useMemo } from 'react';

const API_URL = 'http://localhost:3001/api/agents';

// A single card component for an agent
function AgentCard({ agent }) {
  // Placeholder function for the deploy button
  const handleDeployClick = () => {
    alert(`Deployment for "${agent.name}" would be initiated here.`);
  };

  return (
    <div className="agent-card">
      <div>
        <h3>
          <a href={agent.url} target="_blank" rel="noopener noreferrer">
            {agent.name}
          </a>
        </h3>
        <p className="source-type">{agent.source_type}</p>
        
        {agent.stars !== null && (
          <div className="agent-stats">
            <span>⭐ {agent.stars.toLocaleString()}</span>
            <span>🍴 {agent.forks.toLocaleString()}</span>
          </div>
        )}

        <p>{agent.description}</p>
      </div>
      <div className="card-footer">
        <div className="categories">
          {agent.category.map((cat, index) => (
            <span key={index} className="category-tag">{cat}</span>
          ))}
        </div>
        
        {agent.source_type === 'Open-source' && (
          <button className="deploy-button" onClick={handleDeployClick}>
            🚀 Deploy to GCP
          </button>
        )}
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
  
  // NEW: State for sorting
  const [sortByStars, setSortByStars] = useState(false);

  // Fetch all data initially to populate categories
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const uniqueCategories = [...new Set(data.flatMap(agent => agent.category))];
          setAllCategories(uniqueCategories.sort());
        } else {
          console.error("Initial data fetch did not return an array:", data);
        }
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
      .then(data => {
        if (Array.isArray(data)) {
          setAgents(data);
        } else {
          console.error("Filtered data fetch did not return an array:", data);
          setAgents([]);
        }
      })
      .catch(error => {
        console.error('Error fetching agents:', error)
        setAgents([]);
      });
  }, [searchTerm, selectedCategory, selectedSourceType]);

  // NEW: Memoized sorting logic
  const sortedAgents = useMemo(() => {
    const sortableAgents = [...agents]; // Create a copy to avoid mutating state
    if (sortByStars) {
      // Sort by stars descending (most stars first)
      // `b.stars - a.stars` handles nulls by treating them as 0
      sortableAgents.sort((a, b) => (b.stars || 0) - (a.stars || 0));
    } else {
      // Sort by name alphabetically
      sortableAgents.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sortableAgents;
  }, [agents, sortByStars]);


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
        
        {/* NEW: Checkbox for sorting */}
        <div className="checkbox-container">
          <input 
            type="checkbox" 
            id="usage-rank" 
            checked={sortByStars}
            onChange={(e) => setSortByStars(e.target.checked)}
          />
          <label htmlFor="usage-rank">Usage Rank</label>
        </div>
      </div>

      <div className="results-grid">
        {/* UPDATED: We now map over sortedAgents instead of agents */}
        {sortedAgents.length > 0 ? (
          sortedAgents.map(agent => <AgentCard key={agent.id} agent={agent} />)
        ) : (
          <p>Loading agents or none found matching your criteria...</p>
        )}
      </div>
    </div>
  );
}

export default App;