import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserProfile, fetchUserByEmail } from '@/lib/fetcher';
import { UserProfile as UserProfileType } from '@/models/user';

const UserProfile: React.FC = () => {
  const { user_id } = useParams<{ user_id: string }>();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('user_id', user_id);
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        let actualUserId = user_id;
        // If user_id looks like an email, fetch user_id by email
        if (actualUserId && actualUserId.includes('@')) {
          const userData = await fetchUserByEmail(actualUserId);
          console.log('fetchUserByEmail', actualUserId);
          console.log('userData', userData);
          if (!userData || !userData.id) {
            throw new Error('User not found');
          }
          actualUserId = userData.id;
        }
        console.log('actualUserId', actualUserId);
        const profileData = await fetchUserProfile(actualUserId!);
        console.log('profileData', profileData);
        setProfile(profileData.data ? profileData.data : profileData);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    if (user_id) loadProfile();
  }, [user_id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!profile) return <div>No profile found.</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <p><strong>Username:</strong> {user_id}</p>
      <p><strong>Description:</strong> {profile.description}</p>
      {/* Add more fields as needed */}
    </div>
  );
};

export default UserProfile; 