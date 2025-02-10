import React, { useState, useCallback } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import RepositoryDetails from './components/RepositoryDetails';
import { searchRepositories, getRepositoryDetails } from './services/github';
import { setCacheItem, getCacheItem } from './services/cache';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repoDetails, setRepoDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  const handleSearch = useCallback(async (query) => {
    setIsLoading(true);
    setError(null);
    setSelectedRepo(null);
    setRepoDetails(null);

    try {
      // Check cache first
      const cacheKey = `search_${query}`;
      const cachedResults = getCacheItem(cacheKey);
      
      if (cachedResults) {
        setRepositories(cachedResults);
        setIsLoading(false);
        return;
      }

      // Fetch from API if not in cache
      const results = await searchRepositories(query);
      setRepositories(results.items);
      
      // Cache the results
      setCacheItem(cacheKey, results.items);
    } catch (err) {
      setError(err.message || 'Failed to search repositories');
      setRepositories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectRepository = useCallback(async (repo) => {
    setSelectedRepo(repo);
    setIsLoadingDetails(true);
    setDetailsError(null);

    try {
      // Check cache first
      const cacheKey = `repo_${repo.full_name}`;
      const cachedDetails = getCacheItem(cacheKey);

      if (cachedDetails) {
        setRepoDetails(cachedDetails);
        setIsLoadingDetails(false);
        return;
      }

      // Fetch from API if not in cache
      const [owner, repoName] = repo.full_name.split('/');
      const details = await getRepositoryDetails(owner, repoName);
      setRepoDetails(details);

      // Cache the results
      setCacheItem(cacheKey, details);
    } catch (err) {
      setDetailsError(err.message || 'Failed to fetch repository details');
      setRepoDetails(null);
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedRepo(null);
    setRepoDetails(null);
    setDetailsError(null);
  }, []);

  return (
    <div className="app">
      <header>
        <h1>GitHub Explorer</h1>
      </header>
      
      <main>
        <SearchBar 
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        <div className="content">
          <SearchResults
            repositories={repositories}
            onSelectRepository={handleSelectRepository}
            isLoading={isLoading}
            error={error}
          />

          {(selectedRepo || isLoadingDetails || detailsError) && (
            <RepositoryDetails
              repository={repoDetails}
              onClose={handleCloseDetails}
              isLoading={isLoadingDetails}
              error={detailsError}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
