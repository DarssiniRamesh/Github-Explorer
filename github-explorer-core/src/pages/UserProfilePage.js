import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserInfo } from '../services/github';
import { setCacheItem, getCacheItem } from '../services/cache';
import ProfileHeader from '../components/ProfileHeader';
import ActivityCalendar from '../components/ActivityCalendar';
import OrganizationMemberships from '../components/OrganizationMemberships';

// PUBLIC_INTERFACE
const UserProfilePage = () => {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const cacheKey = `user_${username}`;
        const cachedProfile = getCacheItem(cacheKey);

        if (cachedProfile) {
          setProfile(cachedProfile);
          setIsLoading(false);
          return;
        }

        const userProfile = await getUserInfo(username);
        setProfile(userProfile);
        setCacheItem(cacheKey, userProfile);
      } catch (err) {
        setError(err.message || 'Failed to fetch user profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!profile) {
    return <div>No profile found</div>;
  }

  return (
    <div className="user-profile">
      <ProfileHeader user={profile} loading={isLoading} error={error} />
      <ActivityCalendar username={username} />
      <OrganizationMemberships username={username} />
    </div>
  );
};

export default UserProfilePage;
