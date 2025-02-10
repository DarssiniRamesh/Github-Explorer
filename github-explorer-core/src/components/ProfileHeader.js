import React from 'react';
import PropTypes from 'prop-types';

/**
 * ProfileHeader component displays user's basic information including profile picture,
 * name, bio, location, and other key details
 */
const ProfileHeader = ({ user, loading, error }) => {
  if (loading) {
    return (
      <div className="profile-header loading">
        <div className="loading-indicator" />
        <p>Loading profile information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-header error">
        <p>Error loading profile: {error.message}</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-header">
      <div className="profile-header-main">
        <div className="profile-avatar">
          <img src={user.avatar_url} alt={`${user.login}'s avatar`} />
        </div>
        <div className="profile-info">
          <h1>{user.name || user.login}</h1>
          {user.login && <h2 className="username">@{user.login}</h2>}
          {user.bio && <p className="bio">{user.bio}</p>}
          
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{user.followers}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user.following}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user.public_repos}</span>
              <span className="stat-label">Repositories</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-details">
        {user.location && (
          <div className="detail-item">
            <i className="fas fa-map-marker-alt" />
            <span>{user.location}</span>
          </div>
        )}
        {user.email && (
          <div className="detail-item">
            <i className="fas fa-envelope" />
            <a href={`mailto:${user.email}`}>{user.email}</a>
          </div>
        )}
        {user.blog && (
          <div className="detail-item">
            <i className="fas fa-link" />
            <a href={user.blog} target="_blank" rel="noopener noreferrer">
              {user.blog}
            </a>
          </div>
        )}
        {user.company && (
          <div className="detail-item">
            <i className="fas fa-building" />
            <span>{user.company}</span>
          </div>
        )}
        {user.twitter_username && (
          <div className="detail-item">
            <i className="fab fa-twitter" />
            <a
              href={`https://twitter.com/${user.twitter_username}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              @{user.twitter_username}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

ProfileHeader.propTypes = {
  user: PropTypes.shape({
    login: PropTypes.string.isRequired,
    name: PropTypes.string,
    avatar_url: PropTypes.string.isRequired,
    bio: PropTypes.string,
    location: PropTypes.string,
    email: PropTypes.string,
    blog: PropTypes.string,
    company: PropTypes.string,
    twitter_username: PropTypes.string,
    followers: PropTypes.number.isRequired,
    following: PropTypes.number.isRequired,
    public_repos: PropTypes.number.isRequired
  }),
  loading: PropTypes.bool,
  error: PropTypes.shape({
    message: PropTypes.string
  })
};

export default ProfileHeader;