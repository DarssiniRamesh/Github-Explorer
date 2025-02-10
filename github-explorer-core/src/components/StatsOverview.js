import React from 'react';

// PUBLIC_INTERFACE
const StatsOverview = ({ stats, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="stats-overview loading">
        <div className="loading-indicator"></div>
        <span>Loading stats...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-overview error">
        <span>{error}</span>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statItems = [
    { label: 'Repositories', value: stats.public_repos },
    { label: 'Followers', value: stats.followers },
    { label: 'Following', value: stats.following },
    { label: 'Gists', value: stats.public_gists },
  ];

  return (
    <div className="stats-overview">
      <div className="stats-grid">
        {statItems.map((item) => (
          <div key={item.label} className="stat-item">
            <span className="stat-label">{item.label}</span>
            <span className="stat-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsOverview;