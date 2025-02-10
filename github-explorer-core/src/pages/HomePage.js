import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import TrendingDevelopers from '../components/TrendingDevelopers';
import RecentSearches from '../components/RecentSearches';
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
      <SearchBar 
        onSearch={handleSearch}
        isLoading={isLoading}
      />
      <div className="content">
        <div className="main-content">
          <SearchResults
            repositories={repositories}
            onSelectRepository={handleSelectRepository}
            isLoading={isLoading}
            error={error}
          />
        </div>
        <div className="sidebar">
          <RecentSearches onSearch={handleSearch} />
          <TrendingDevelopers />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
