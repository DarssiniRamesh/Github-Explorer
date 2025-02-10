import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../services/github';
import { setCacheItem, getCacheItem } from '../services/cache';
import { AuthenticationError, RateLimitError, NetworkError } from '../utils/errors';

// PUBLIC_INTERFACE
const TrendingDevelopers = () => {
  const navigate = useNavigate();
  const [developers, setDevelopers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingDevelopers = async () => {
      const cacheKey = 'trending_developers';
      const cachedDevelopers = getCacheItem(cacheKey);

      if (cachedDevelopers) {
        setDevelopers(cachedDevelopers);
        setIsLoading(false);
        return;
      }

      try {
        const results = await searchUsers({ sort: 'followers', order: 'desc', per_page: 5 });
        setDevelopers(results.items);
        setCacheItem(cacheKey, results.items);
      } catch (err) {
        setError(err.message || 'Failed to fetch trending developers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingDevelopers();
  }, []);

  const handleDeveloperClick = (username) => {
    navigate(`/profile/${username}`);
  };

  if (isLoading) {
    return <div className="trending-developers loading">Loading trending developers...</div>;
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
          Login to View Trending
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
      <div className={`trending-developers ${errorClass}`}>
        <div className="error-message">{errorMessage}</div>
        {actionButton}
      </div>
    );
  }

  return (
    <div className="trending-developers">
      <h2>Trending Developers</h2>
      <div className="developers-list">
        {developers.map((developer) => (
          <div
            key={developer.id}
            className="developer-card clickable"
            onClick={() => handleDeveloperClick(developer.login)}
          >
            <img
              src={developer.avatar_url}
              alt={`${developer.login}'s avatar`}
              className="developer-avatar"
            />
            <div className="developer-info">
              <h3>{developer.login}</h3>
              <p>Followers: {developer.followers}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingDevelopers;
