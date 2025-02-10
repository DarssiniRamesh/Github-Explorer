import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProfileHeader from '../components/ProfileHeader';
import ErrorBoundary from '../components/ErrorBoundary';
import ActivityCalendar from '../components/ActivityCalendar';
import StatsOverview from '../components/StatsOverview';
import OrganizationMemberships from '../components/OrganizationMemberships';
import PublicRepositoriesList from '../components/PublicRepositoriesList';

// PUBLIC_INTERFACE
const ProfileDetailsPage = () => {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Initial data load is handled by child components
        // This is just to ensure we show loading state initially
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    // This will trigger a re-render of child components
    // which will reload their data
  };

  if (isLoading) {
    return (
      <div className="profile-details-page loading">
        <div className="loading-indicator"></div>
        <p>Loading profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-details-page error">
        <p>{error}</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    );
  }

  return (
    <div className="profile-details-page">
      <ErrorBoundary fallback={<div>Failed to load profile header. Please try refreshing the page.</div>}>
        <ProfileHeader username={username} />
      </ErrorBoundary>
      <div className="profile-content">
        <ErrorBoundary fallback={<div>Failed to load stats overview. Please try refreshing the page.</div>}>
          <StatsOverview username={username} />
        </ErrorBoundary>
        <ErrorBoundary fallback={<div>Failed to load repositories list. Please try refreshing the page.</div>}>
          <PublicRepositoriesList username={username} />
        </ErrorBoundary>
        <ErrorBoundary fallback={<div>Failed to load activity calendar. Please try refreshing the page.</div>}>
          <ActivityCalendar username={username} />
        </ErrorBoundary>
        <ErrorBoundary fallback={<div>Failed to load organization memberships. Please try refreshing the page.</div>}>
          <OrganizationMemberships username={username} />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default ProfileDetailsPage;
