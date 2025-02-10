import React from 'react';

// PUBLIC_INTERFACE
/**
 * SearchResults component to display repository list
 * @param {Object} props
 * @param {Array} props.repositories - List of repositories to display
 * @param {function} props.onSelectRepository - Callback when a repository is selected
 * @param {boolean} props.isLoading - Loading state indicator
 * @param {string} props.error - Error message if any
 */
const SearchResults = ({ repositories, onSelectRepository, isLoading, error }) => {
  if (isLoading) {
    return <div className="search-results loading">Loading repositories...</div>;
  }

  if (error) {
    return <div className="search-results error">{error}</div>;
  }

  if (!repositories?.length) {
    return <div className="search-results empty">No repositories found</div>;
  }

  return (
    <div className="search-results">
      {repositories.map((repo) => (
        <div
          key={repo.id}
          className="repository-item"
          onClick={() => onSelectRepository(repo)}
        >
          <h3>{repo.full_name}</h3>
          <p>{repo.description}</p>
          <div className="repository-stats">
            <span>⭐ {repo.stargazers_count}</span>
            <span>🔄 {repo.forks_count}</span>
            <span>👁️ {repo.watchers_count}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;