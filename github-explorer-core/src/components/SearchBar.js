import React, { useState } from 'react';

// PUBLIC_INTERFACE
/**
 * SearchBar component for repository search
 * @param {Object} props
 * @param {function} props.onSearch - Callback function when search is triggered
 * @param {boolean} props.isLoading - Loading state indicator
 */
const SearchBar = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search GitHub repositories..."
        disabled={isLoading}
      />
      {isLoading && <div className="loading-indicator" />}
      <button type="submit" disabled={isLoading || !query.trim()}>
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
};

export default SearchBar;
