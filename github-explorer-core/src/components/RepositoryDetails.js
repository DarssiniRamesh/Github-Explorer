import React from 'react';

// PUBLIC_INTERFACE
/**
 * RepositoryDetails component for showing detailed repository information
 * @param {Object} props
 * @param {Object} props.repository - Repository details object
 * @param {function} props.onClose - Callback to close the details view
 * @param {boolean} props.isLoading - Loading state indicator
 * @param {string} props.error - Error message if any
 */
const RepositoryDetails = ({ repository, onClose, isLoading, error }) => {
  if (isLoading) {
    return <div className="repository-details loading">Loading repository details...</div>;
  }

  if (error) {
    return (
      <div className="repository-details error">
        <div className="error-message">{error}</div>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  if (!repository) {
    return null;
  }

  return (
    <div className="repository-details">
      <button className="close-button" onClick={onClose}>×</button>
      <h2>{repository.full_name}</h2>
      <p className="description">{repository.description}</p>
      
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Stars</span>
          <span className="stat-value">{repository.stargazers_count}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Forks</span>
          <span className="stat-value">{repository.forks_count}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Open Issues</span>
          <span className="stat-value">{repository.open_issues_count}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Watchers</span>
          <span className="stat-value">{repository.watchers_count}</span>
        </div>
      </div>

      <div className="repository-meta">
        <p><strong>Language:</strong> {repository.language}</p>
        <p><strong>Created:</strong> {new Date(repository.created_at).toLocaleDateString()}</p>
        <p><strong>Last Updated:</strong> {new Date(repository.updated_at).toLocaleDateString()}</p>
      </div>

      <div className="repository-links">
        <a href={repository.html_url} target="_blank" rel="noopener noreferrer" className="repo-link">
          View on GitHub
        </a>
        {repository.homepage && (
          <a href={repository.homepage} target="_blank" rel="noopener noreferrer" className="homepage-link">
            Visit Homepage
          </a>
        )}
      </div>
    </div>
  );
};

export default RepositoryDetails;