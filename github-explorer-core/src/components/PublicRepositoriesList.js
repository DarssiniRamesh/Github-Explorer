import React, { useState, useEffect } from 'react';
import { searchRepositories } from '../services/github';

// PUBLIC_INTERFACE
const PublicRepositoriesList = ({ username }) => {
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('stars');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadRepositories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const query = `user:${username} ${filter}`;
        const result = await searchRepositories(query, {
          sort: sortBy,
          order: sortOrder,
          page,
          per_page: 10
        });

        if (page === 1) {
          setRepositories(result.items);
        } else {
          setRepositories(prev => [...prev, ...result.items]);
        }
        
        setHasMore(result.items.length === 10);
      } catch (err) {
        setError('Failed to load repositories');
        console.error('Error loading repositories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRepositories();
  }, [username, filter, sortBy, sortOrder, page]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handleOrderChange = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    setPage(1);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (error) {
    return (
      <div className="public-repositories-list error">
        <p>{error}</p>
        <button onClick={() => setPage(1)}>Retry</button>
      </div>
    );
  }

  return (
    <div className="public-repositories-list">
      <div className="repositories-controls">
        <input
          type="text"
          placeholder="Filter repositories..."
          value={filter}
          onChange={handleFilterChange}
          className="repository-filter"
        />
        <div className="sort-controls">
          <select value={sortBy} onChange={handleSortChange}>
            <option value="stars">Stars</option>
            <option value="forks">Forks</option>
            <option value="updated">Last Updated</option>
          </select>
          <button onClick={handleOrderChange}>
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      <div className="repositories-grid">
        {repositories.map(repo => (
          <div key={repo.id} className="repository-card">
            <h3>{repo.name}</h3>
            <p>{repo.description}</p>
            <div className="repository-meta">
              <span>⭐ {repo.stargazers_count}</span>
              <span>🔀 {repo.forks_count}</span>
              <span>🔵 {repo.language}</span>
            </div>
            <div className="repository-updated">
              Updated: {new Date(repo.updated_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading repositories...</p>
        </div>
      )}

      {!isLoading && hasMore && (
        <button onClick={loadMore} className="load-more-button">
          Load More
        </button>
      )}
    </div>
  );
};

export default PublicRepositoriesList;