import React from 'react';
import { AuthenticationError, RateLimitError, NetworkError } from '../utils/errors';

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
    let errorMessage = error;
    let errorClass = 'error';
    let actionButton = null;

    if (error instanceof AuthenticationError) {
      errorClass = 'auth-error';
      actionButton = (
        <button 
          className="button-primary" 
          onClick={() => window.location.href = '/login'}
        >
          Login to Search
        </button>
      );
    } else if (error instanceof RateLimitError) {
      errorClass = 'rate-limit-error';
      errorMessage = `${error.message} Please try again later.`;
    } else if (error instanceof NetworkError) {
      errorClass = 'network-error';
      actionButton = (
        <button 
          className="button-primary" 
          onClick={() => window.location.reload()}
        >
          Retry Search
        </button>
      );
    }

    return (
      <div className={`search-results ${errorClass}`}>
        <div className="error-message">{errorMessage}</div>
        {actionButton}
      </div>
    );
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
