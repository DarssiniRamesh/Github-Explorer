import React, { useState, useEffect } from 'react';
import { getRepositoryContributors } from '../services/github';
import { getCacheItem, setCacheItem } from '../services/cache';

// PUBLIC_INTERFACE
/**
 * ContributorsList component displays repository contributors with their stats
 * and provides sorting functionality
 * @param {Object} props - Component props
 * @param {string} props.owner - Repository owner username
 * @param {string} props.repo - Repository name
 */
const ContributorsList = ({ owner, repo }) => {
  const [contributors, setContributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('commits');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        setIsLoading(true);
        const cacheKey = `contributors_${owner}/${repo}_${sortBy}_${page}`;
        const cachedData = getCacheItem(cacheKey);

        if (cachedData) {
          setContributors(prevContributors => 
            page === 1 ? cachedData : [...prevContributors, ...cachedData]
          );
          setHasMore(cachedData.length === 30); // GitHub's default per_page
          setIsLoading(false);
          return;
        }

        const data = await getRepositoryContributors(owner, repo, {
          sort: sortBy,
          page,
          per_page: 30
        });

        setContributors(prevContributors => 
          page === 1 ? data : [...prevContributors, ...data]
        );
        setHasMore(data.length === 30);
        setCacheItem(cacheKey, data);
      } catch (err) {
        setError(err.message || 'Failed to fetch contributors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributors();
  }, [owner, repo, sortBy, page]);

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setPage(1);
    setContributors([]);
  };

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  if (error) {
    return (
      <div className="contributors-list error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="contributors-list">
      <div className="contributors-header">
        <h2>Contributors</h2>
        <select 
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="sort-select"
        >
          <option value="commits">Sort by Commits</option>
          <option value="contributions">Sort by Contributions</option>
        </select>
      </div>

      <div className="contributors-grid">
        {contributors.map((contributor) => (
          <div key={contributor.id} className="contributor-card">
            <img
              src={contributor.avatar_url}
              alt={`${contributor.login}'s avatar`}
              className="contributor-avatar"
            />
            <div className="contributor-info">
              <h3>{contributor.login}</h3>
              <p>{contributor.contributions} contributions</p>
            </div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="contributors-loading">
          Loading contributors...
        </div>
      )}

      {!isLoading && hasMore && (
        <button 
          className="load-more"
          onClick={loadMore}
        >
          Load More Contributors
        </button>
      )}
    </div>
  );
};

export default ContributorsList;