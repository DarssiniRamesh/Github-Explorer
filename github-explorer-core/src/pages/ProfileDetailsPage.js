import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProfileHeader from '../components/ProfileHeader';
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
      <ProfileHeader username={username} />
      <div className="profile-content">
        <StatsOverview username={username} />
        <PublicRepositoriesList username={username} />
        <ActivityCalendar username={username} />
        <OrganizationMemberships username={username} />
      </div>
    </div>
  );
};

export default ProfileDetailsPage;
