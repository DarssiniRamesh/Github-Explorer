import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { getRepositoryReadme } from '../services/github';
import { setCacheItem, getCacheItem } from '../services/cache';

// PUBLIC_INTERFACE
/**
 * ReadmePreview component displays the README content of a GitHub repository
 * with markdown rendering support
 * @param {Object} props - Component props
 * @param {string} props.owner - Repository owner username
 * @param {string} props.repo - Repository name
 */
const ReadmePreview = ({ owner, repo }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReadme = async () => {
      try {
        const cacheKey = `readme_${owner}/${repo}`;
        const cachedContent = getCacheItem(cacheKey);

        if (cachedContent) {
          setContent(cachedContent);
          setIsLoading(false);
          return;
        }

        const readmeContent = await getRepositoryReadme(owner, repo);
        setContent(readmeContent);
        setCacheItem(cacheKey, readmeContent);
      } catch (err) {
        setError(err.message || 'Failed to load README');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReadme();
  }, [owner, repo]);

  if (isLoading) {
    return (
      <div className="readme-preview loading">
        <div className="loading-indicator"></div>
        <p>Loading README...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="readme-preview error">
        <p>{error}</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="readme-preview empty">
        <p>No README found for this repository.</p>
      </div>
    );
  }

  // Convert markdown to HTML and sanitize
  const htmlContent = DOMPurify.sanitize(marked(content));

  return (
    <div className="readme-preview">
      <h2>README</h2>
      <div 
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

export default ReadmePreview;