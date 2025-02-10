import React, { useState, useEffect } from 'react';
import { getUserOrganizations } from '../services/github';
import { setCacheItem, getCacheItem } from '../services/cache';

// PUBLIC_INTERFACE
const OrganizationMemberships = ({ username }) => {
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const cacheKey = `user_orgs_${username}`;
        const cachedOrgs = getCacheItem(cacheKey);

        if (cachedOrgs) {
          setOrganizations(cachedOrgs);
          setIsLoading(false);
          return;
        }

        const userOrgs = await getUserOrganizations(username);
        setOrganizations(userOrgs);
        setCacheItem(cacheKey, userOrgs);
      } catch (err) {
        setError(err.message || 'Failed to fetch organizations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, [username]);

  if (isLoading) {
    return <div className="organizations-loading">Loading organizations...</div>;
  }

  if (error) {
    return <div className="organizations-error">{error}</div>;
  }

  if (!organizations.length) {
    return <div className="organizations-empty">No organizations found</div>;
  }

  return (
    <div className="organizations-section">
      <h3>Organizations</h3>
      <div className="organizations-grid">
        {organizations.map(org => (
          <a
            key={org.id}
            href={`https://github.com/${org.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="organization-card"
          >
            <img src={org.avatar_url} alt={org.login} className="organization-avatar" />
            <span className="organization-name">{org.login}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default OrganizationMemberships;