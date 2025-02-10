import React, { useMemo } from 'react';
import { AuthenticationError, RateLimitError, NetworkError } from '../utils/errors';

// PUBLIC_INTERFACE
/**
 * RepositoryDetails component for showing detailed repository information
 * Displays comprehensive information about a GitHub repository including stats,
 * metadata, and quick action links in a well-organized layout
 * 
 * @param {Object} props
 * @param {Object} props.repository - Repository details object from GitHub API
 * @param {function} props.onClose - Callback to close the details view
 * @param {boolean} props.isLoading - Loading state indicator
 * @param {string} props.error - Error message if any
 * @returns {JSX.Element|null} The rendered repository details or null if no repository
 */
const RepositoryDetails = ({ repository, onClose, isLoading, error }) => {
  const formattedStats = useMemo(() => {
    if (!repository) return null;
    return {
      stars: repository.stargazers_count.toLocaleString(),
      forks: repository.forks_count.toLocaleString(),
      issues: repository.open_issues_count.toLocaleString(),
      watchers: repository.watchers_count.toLocaleString(),
      size: (repository.size / 1024).toFixed(2) + ' MB'
    };
  }, [repository]);
  if (isLoading) {
    return (
      <div className="repository-details loading">
        <div className="loading-spinner">Loading repository details...</div>
      </div>
    );
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
          Login
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
          Retry
        </button>
      );
    }

    return (
      <div className={`repository-details ${errorClass}`}>
        <div className="error-message">{errorMessage}</div>
        {actionButton}
        <button className="button-secondary" onClick={onClose}>Close</button>
      </div>
    );
  }

  if (!repository) {
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <article className="repository-details">
      <header className="repository-header">
        <div className="header-main">
          <button 
            className="close-button" 
            onClick={onClose} 
            aria-label="Close repository details"
          >
            ×
          </button>
          <h1 className="repository-title">
            <a 
              href={`https://github.com/${repository.owner.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="repo-owner"
            >
              {repository.owner.login}
            </a>
            <span className="repo-separator" aria-hidden="true">/</span>
            <a 
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="repo-name"
            >
              {repository.name}
            </a>
          </h1>
          <div className="repository-badges" aria-label="Repository status">
            {repository.private && <span className="badge private-badge" role="status">Private</span>}
            {repository.archived && <span className="badge archived-badge" role="status">Archived</span>}
            {repository.fork && <span className="badge fork-badge" role="status">Fork</span>}
          </div>
        </div>
        <div className="repository-description">
          {repository.description ? (
            <p>{repository.description}</p>
          ) : (
            <p className="no-description" aria-label="No description available">No description provided</p>
          )}
        </div>
      </header>
      
      <section className="repository-stats" aria-label="Repository statistics">
        <h2 className="section-title visually-hidden">Repository Statistics</h2>
        <div className="stats-grid" role="list">
          <div className="stat-item" role="listitem">
            <span className="stat-label" id="stars-label">Stars</span>
            <span className="stat-value" aria-labelledby="stars-label">{formattedStats.stars}</span>
          </div>
          <div className="stat-item" role="listitem">
            <span className="stat-label" id="forks-label">Forks</span>
            <span className="stat-value" aria-labelledby="forks-label">{formattedStats.forks}</span>
          </div>
          <div className="stat-item" role="listitem">
            <span className="stat-label" id="issues-label">Issues</span>
            <span className="stat-value" aria-labelledby="issues-label">{formattedStats.issues}</span>
          </div>
          <div className="stat-item" role="listitem">
            <span className="stat-label" id="watchers-label">Watchers</span>
            <span className="stat-value" aria-labelledby="watchers-label">{formattedStats.watchers}</span>
          </div>
          <div className="stat-item" role="listitem">
            <span className="stat-label" id="size-label">Size</span>
            <span className="stat-value" aria-labelledby="size-label">{formattedStats.size}</span>
          </div>
        </div>
      </section>

      <div className="repository-details-grid">
        <section className="repository-meta" aria-labelledby="repo-info-title">
          <h2 className="section-title" id="repo-info-title">Repository Information</h2>
          <div className="meta-grid" role="list">
            <div className="meta-item" role="listitem">
              <span className="meta-label" id="language-label">Primary Language</span>
              <span className="meta-value language" aria-labelledby="language-label">
                {repository.language || 'Not specified'}
              </span>
            </div>
            <div className="meta-item" role="listitem">
              <span className="meta-label" id="created-label">Created</span>
              <span className="meta-value" aria-labelledby="created-label">
                <time dateTime={repository.created_at}>{formatDate(repository.created_at)}</time>
              </span>
            </div>
            <div className="meta-item" role="listitem">
              <span className="meta-label" id="updated-label">Last Updated</span>
              <span className="meta-value" aria-labelledby="updated-label">
                <time dateTime={repository.updated_at}>{formatDate(repository.updated_at)}</time>
              </span>
            </div>
            <div className="meta-item" role="listitem">
              <span className="meta-label" id="branch-label">Default Branch</span>
              <span className="meta-value" aria-labelledby="branch-label">{repository.default_branch}</span>
            </div>
            {repository.license && (
              <div className="meta-item" role="listitem">
                <span className="meta-label" id="license-label">License</span>
                <span className="meta-value" aria-labelledby="license-label">{repository.license.name}</span>
              </div>
            )}
            <div className="meta-item topics-container" role="listitem">
              <span className="meta-label" id="topics-label">Topics</span>
              <div className="topics-list" role="list" aria-labelledby="topics-label">
                {repository.topics && repository.topics.length > 0 ? (
                  repository.topics.map(topic => (
                    <span 
                      key={topic} 
                      className="topic-tag" 
                      role="listitem"
                    >
                      {topic}
                    </span>
                  ))
                ) : (
                  <span className="no-topics" role="listitem">No topics</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="repository-actions" aria-labelledby="quick-actions-title">
          <h2 className="section-title" id="quick-actions-title">Quick Actions</h2>
          <div className="action-buttons" role="group" aria-label="Repository quick actions">
            <a 
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="button-primary repo-link"
              aria-label="View repository on GitHub (opens in new tab)"
            >
              <span aria-hidden="true">View on GitHub</span>
            </a>
            {repository.homepage && (
              <a 
                href={repository.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="button-secondary homepage-link"
                aria-label="Visit project homepage (opens in new tab)"
              >
                <span aria-hidden="true">Visit Homepage</span>
              </a>
            )}
            <a 
              href={`${repository.html_url}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="button-secondary issues-link"
              aria-label={`View ${formattedStats.issues} issues (opens in new tab)`}
            >
              <span aria-hidden="true">View Issues</span>
            </a>
            <a 
              href={`${repository.html_url}/network/members`}
              target="_blank"
              rel="noopener noreferrer"
              className="button-secondary forks-link"
              aria-label={`View ${formattedStats.forks} forks (opens in new tab)`}
            >
              <span aria-hidden="true">View Forks</span>
            </a>
          </div>
        </section>
      </div>
    </article>
  );
};

export default RepositoryDetails;
