import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RepositoryDetails from '../components/RepositoryDetails';
import ErrorBoundary from '../components/ErrorBoundary';
import ReadmePreview from '../components/ReadmePreview';
import CommitHistory from '../components/CommitHistory';
import ContributorsList from '../components/ContributorsList';
import RepositorySidebar from '../components/RepositorySidebar';
import { getRepositoryDetails } from '../services/github';
import { setCacheItem, getCacheItem } from '../services/cache';

// PUBLIC_INTERFACE
/**
 * Repository Details Page component
 * Displays comprehensive information about a GitHub repository
 * including details, README, commit history, and contributors
 */
const RepositoryDetailsPage = () => {
  const { username, reponame } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repoDetails, setRepoDetails] = useState(null);

  const fetchRepositoryDetails = useCallback(async () => {
    try {
      const cacheKey = `repo_${username}/${reponame}`;
      const cachedDetails = getCacheItem(cacheKey);

      if (cachedDetails) {
        setRepoDetails(cachedDetails);
        setIsLoading(false);
        return;
      }

      const details = await getRepositoryDetails(username, reponame);
      setRepoDetails(details);
      setCacheItem(cacheKey, details);
    } catch (err) {
      setError(err.message || 'Failed to fetch repository details');
    } finally {
      setIsLoading(false);
    }
  }, [username, reponame]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchRepositoryDetails();
  }, [fetchRepositoryDetails]);

  const handleClose = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    fetchRepositoryDetails();
  };

  if (isLoading) {
    return (
      <div className="repository-details-container">
        <RepositorySidebar className="repository-sidebar-component" />
        <div className="repository-content">
          <div className="loading-container">
            <div className="loading-spinner">Loading repository details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="repository-details-container">
        <RepositorySidebar className="repository-sidebar-component" />
        <div className="repository-content">
          <div className="error-container">
            <div className="error-message">{error}</div>
            <div className="error-actions">
              <button className="button-primary" onClick={handleRefresh}>
                Try Again
              </button>
              <button className="button-secondary" onClick={handleClose}>
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!repoDetails) {
    return (
      <div className="repository-details-container">
        <RepositorySidebar className="repository-sidebar-component" />
        <div className="repository-content">
          <div className="error-container">
            <div className="error-message">Repository not found</div>
            <button className="button-secondary" onClick={handleClose}>
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="repository-details-container">
      <RepositorySidebar className="repository-sidebar-component" />
      <div className="repository-content">
        <div className="content-header">
          <button className="refresh-button" onClick={handleRefresh} aria-label="Refresh">
            ↻
          </button>
        </div>
        <div id="overview" className="content-section">
          <ErrorBoundary fallback={<div>Failed to load repository details. Please try refreshing the page.</div>}>
            <RepositoryDetails
              repository={repoDetails}
              onClose={handleClose}
              isLoading={isLoading}
              error={error}
            />
          </ErrorBoundary>
        </div>
        <div className="content-sections-grid">
          <div id="readme" className="content-section">
            <h3 className="section-title">README</h3>
            <ErrorBoundary fallback={<div>Failed to load README. Please try refreshing the page.</div>}>
              <ReadmePreview
                owner={username}
                repo={reponame}
              />
            </ErrorBoundary>
          </div>
          <div id="commit-history" className="content-section">
            <h3 className="section-title">Recent Commits</h3>
            <ErrorBoundary fallback={<div>Failed to load commit history. Please try refreshing the page.</div>}>
              <CommitHistory
                owner={username}
                repo={reponame}
              />
            </ErrorBoundary>
          </div>
          <div id="contributors" className="content-section">
            <h3 className="section-title">Contributors</h3>
            <ErrorBoundary fallback={<div>Failed to load contributors list. Please try refreshing the page.</div>}>
              <ContributorsList
                owner={username}
                repo={reponame}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepositoryDetailsPage;
