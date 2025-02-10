import React, { useState, useEffect } from 'react';
import { getCommitHistory } from '../services/github';
import { setCacheItem, getCacheItem } from '../services/cache';

// PUBLIC_INTERFACE
/**
 * CommitHistory component displays a repository's commit timeline with pagination
 * @param {Object} props - Component props
 * @param {string} props.owner - Repository owner username
 * @param {string} props.repo - Repository name
 */
const CommitHistory = ({ owner, repo }) => {
  const [commits, setCommits] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        setIsLoading(true);
        const cacheKey = `commits_${owner}/${repo}_${page}`;
        const cachedCommits = getCacheItem(cacheKey);

        if (cachedCommits) {
          setCommits(prevCommits => page === 1 ? cachedCommits : [...prevCommits, ...cachedCommits]);
          setIsLoading(false);
          setHasMore(cachedCommits.length === 30); // GitHub's default per_page is 30
          return;
        }

        const response = await getCommitHistory(owner, repo, { page });
        setCommits(prevCommits => page === 1 ? response : [...prevCommits, ...response]);
        setCacheItem(cacheKey, response);
        setHasMore(response.length === 30);
      } catch (err) {
        setError(err.message || 'Failed to fetch commit history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommits();
  }, [owner, repo, page]);

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  if (error) {
    return (
      <div className="commit-history error">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="commit-history">
      <h3>Commit History</h3>
      <div className="commit-list">
        {commits.map((commit, index) => (
          <div key={commit.sha} className="commit-item">
            <div className="commit-header">
              <img
                src={commit.author?.avatar_url}
                alt={commit.author?.login || 'Unknown'}
                className="author-avatar"
              />
              <div className="commit-info">
                <h4>{commit.commit.message.split('\n')[0]}</h4>
                <p className="commit-meta">
                  by {commit.author?.login || commit.commit.author.name} on{' '}
                  {new Date(commit.commit.author.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            {commit.commit.message.split('\n').slice(1).join('\n') && (
              <div className="commit-body">
                <p>{commit.commit.message.split('\n').slice(1).join('\n')}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      {isLoading && <div className="loading">Loading commits...</div>}
      {!isLoading && hasMore && (
        <button onClick={loadMore} className="load-more">
          Load More Commits
        </button>
      )}
    </div>
  );
};

export default CommitHistory;