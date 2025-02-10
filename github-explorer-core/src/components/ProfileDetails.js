import React from 'react';
import { AuthenticationError, RateLimitError, NetworkError } from '../utils/errors';

// PUBLIC_INTERFACE
/**
 * ProfileDetails component for showing detailed user profile information
 * Displays comprehensive information about a GitHub user including their
 * profile data, statistics, and activity overview
 * 
 * @param {Object} props
 * @param {Object} props.profile - User profile data from GitHub API
 * @param {function} props.onClose - Callback to close the profile view
 * @param {boolean} props.isLoading - Loading state indicator
 * @param {Object} props.error - Error object if any
 * @returns {JSX.Element|null} The rendered profile details or null if no profile
 */
const ProfileDetails = ({ profile, onClose, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="profile-details loading">
        <div className="loading-spinner">Loading profile details...</div>
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
          Login to View Profile
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
          Retry Loading
        </button>
      );
    }

    return (
      <div className={`profile-details ${errorClass}`}>
        <div className="error-message">{errorMessage}</div>
        {actionButton}
        <button className="button-secondary" onClick={onClose}>Close</button>
      </div>
    );
  }

  if (!profile) {
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
    <article className="profile-details">
      <header className="profile-header">
        <div className="header-main">
          <button 
            className="close-button" 
            onClick={onClose} 
            aria-label="Close profile details"
          >
            ×
          </button>
          <div className="profile-avatar">
            <img 
              src={profile.avatar_url} 
              alt={`${profile.login}'s avatar`}
              className="avatar-image"
            />
          </div>
          <div className="profile-info">
            <h1 className="profile-name">
              {profile.name || profile.login}
              {profile.login && <span className="profile-username">@{profile.login}</span>}
            </h1>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          </div>
        </div>
      </header>

      <section className="profile-stats" aria-label="Profile statistics">
        <h2 className="section-title visually-hidden">Profile Statistics</h2>
        <div className="stats-grid" role="list">
          <div className="stat-item" role="listitem">
            <span className="stat-label" id="followers-label">Followers</span>
            <span className="stat-value" aria-labelledby="followers-label">
              {profile.followers?.toLocaleString()}
            </span>
          </div>
          <div className="stat-item" role="listitem">
            <span className="stat-label" id="following-label">Following</span>
            <span className="stat-value" aria-labelledby="following-label">
              {profile.following?.toLocaleString()}
            </span>
          </div>
          <div className="stat-item" role="listitem">
            <span className="stat-label" id="repos-label">Public Repos</span>
            <span className="stat-value" aria-labelledby="repos-label">
              {profile.public_repos?.toLocaleString()}
            </span>
          </div>
          <div className="stat-item" role="listitem">
            <span className="stat-label" id="gists-label">Public Gists</span>
            <span className="stat-value" aria-labelledby="gists-label">
              {profile.public_gists?.toLocaleString()}
            </span>
          </div>
        </div>
      </section>

      <section className="profile-meta" aria-labelledby="profile-info-title">
        <h2 className="section-title" id="profile-info-title">Profile Information</h2>
        <div className="meta-grid" role="list">
          {profile.company && (
            <div className="meta-item" role="listitem">
              <span className="meta-label" id="company-label">Company</span>
              <span className="meta-value" aria-labelledby="company-label">
                {profile.company}
              </span>
            </div>
          )}
          {profile.location && (
            <div className="meta-item" role="listitem">
              <span className="meta-label" id="location-label">Location</span>
              <span className="meta-value" aria-labelledby="location-label">
                {profile.location}
              </span>
            </div>
          )}
          {profile.blog && (
            <div className="meta-item" role="listitem">
              <span className="meta-label" id="website-label">Website</span>
              <a 
                href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
                target="_blank"
                rel="noopener noreferrer"
                className="meta-value link"
                aria-labelledby="website-label"
              >
                {profile.blog}
              </a>
            </div>
          )}
          {profile.twitter_username && (
            <div className="meta-item" role="listitem">
              <span className="meta-label" id="twitter-label">Twitter</span>
              <a 
                href={`https://twitter.com/${profile.twitter_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="meta-value link"
                aria-labelledby="twitter-label"
              >
                @{profile.twitter_username}
              </a>
            </div>
          )}
          <div className="meta-item" role="listitem">
            <span className="meta-label" id="joined-label">Joined GitHub</span>
            <span className="meta-value" aria-labelledby="joined-label">
              <time dateTime={profile.created_at}>{formatDate(profile.created_at)}</time>
            </span>
          </div>
        </div>
      </section>

      <section className="profile-actions" aria-labelledby="quick-actions-title">
        <h2 className="section-title" id="quick-actions-title">Quick Actions</h2>
        <div className="action-buttons" role="group" aria-label="Profile quick actions">
          <a 
            href={profile.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="button-primary profile-link"
            aria-label="View profile on GitHub (opens in new tab)"
          >
            <span aria-hidden="true">View on GitHub</span>
          </a>
          <a 
            href={`${profile.html_url}?tab=repositories`}
            target="_blank"
            rel="noopener noreferrer"
            className="button-secondary repositories-link"
            aria-label={`View ${profile.public_repos} repositories (opens in new tab)`}
          >
            <span aria-hidden="true">View Repositories</span>
          </a>
          <a 
            href={`${profile.html_url}?tab=followers`}
            target="_blank"
            rel="noopener noreferrer"
            className="button-secondary followers-link"
            aria-label={`View ${profile.followers} followers (opens in new tab)`}
          >
            <span aria-hidden="true">View Followers</span>
          </a>
        </div>
      </section>
    </article>
  );
};

export default ProfileDetails;