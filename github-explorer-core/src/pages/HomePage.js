import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import TrendingDevelopers from '../components/TrendingDevelopers';
import RecentSearches from '../components/RecentSearches';
import ErrorBoundary from '../components/ErrorBoundary';
import { searchRepositories } from '../services/github';
import { setCacheItem, getCacheItem } from '../services/cache';

// PUBLIC_INTERFACE
const HomePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [repositories, setRepositories] = useState([]);

  const handleSearch = useCallback(async (query) => {
    setIsLoading(true);
    setError(null);

    try {
      const cacheKey = `search_${query}`;
      const cachedResults = getCacheItem(cacheKey);
      
      // Store in recent searches
      const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      if (!recentSearches.includes(query)) {
        const updatedSearches = [query, ...recentSearches].slice(0, 10);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      }

      if (cachedResults) {
        setRepositories(cachedResults);
        setIsLoading(false);
        return;
      }

      const results = await searchRepositories(query);
      setRepositories(results.items);
      setCacheItem(cacheKey, results.items);
    } catch (err) {
      setError(err.message || 'Failed to search repositories');
      setRepositories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectRepository = useCallback((repo) => {
    const [owner, repoName] = repo.full_name.split('/');
    navigate(`/repo/${owner}/${repoName}`);
  }, [navigate]);

  return (
    <div className="home-page">
      <ErrorBoundary fallback={<div>Failed to load search functionality. Please refresh the page.</div>}>
        <SearchBar 
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      </ErrorBoundary>
      <div className="content">
        <div className="main-content">
          <ErrorBoundary fallback={<div>Failed to load search results. Please try searching again.</div>}>
            <SearchResults
              repositories={repositories}
              onSelectRepository={handleSelectRepository}
              isLoading={isLoading}
              error={error}
            />
          </ErrorBoundary>
        </div>
        <div className="sidebar">
          <ErrorBoundary fallback={<div>Failed to load recent searches. Please refresh the page.</div>}>
            <RecentSearches onSearch={handleSearch} />
          </ErrorBoundary>
          <ErrorBoundary fallback={<div>Failed to load trending developers. Please refresh the page.</div>}>
            <TrendingDevelopers />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
