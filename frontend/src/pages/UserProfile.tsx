import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserProfile, fetchUserByEmail } from '@/lib/fetcher';
import { UserProfile as UserProfileType } from '@/models/user';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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

  if (loading) {
    return (
      <div className="max-w-xl mx-auto mt-10">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-10">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return <div className="max-w-xl mx-auto mt-10">No profile found.</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {/* If you have a profile image, use <AvatarImage src={profile.imageUrl} /> */}
              <AvatarFallback>{profile.user_id?.[0]?.toUpperCase() || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="mb-1">{profile.user_id}</CardTitle>
              {/* You can add a badge or status here if needed */}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-2">
            <Label>Description</Label>
            <div className="text-muted-foreground mt-1 text-base">
              {profile.description || <span className="italic text-gray-400">No description provided.</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile; 