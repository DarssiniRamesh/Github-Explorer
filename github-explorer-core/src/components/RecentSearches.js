import React from 'react';

// PUBLIC_INTERFACE
const RecentSearches = ({ onSearch }) => {
  const [recentSearches, setRecentSearches] = React.useState([]);

  React.useEffect(() => {
    // Load recent searches from localStorage
    const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(searches);
  }, []);

  const handleSearchClick = (query) => {
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className="recent-searches">
      <h2>Recent Searches</h2>
      {recentSearches.length > 0 ? (
        <ul className="recent-searches-list">
          {recentSearches.map((search, index) => (
            <li key={index}>
              <button 
                onClick={() => handleSearchClick(search)}
                className="recent-search-item"
              >
                {search}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-searches">No recent searches</p>
      )}
    </div>
  );
};

export default RecentSearches;