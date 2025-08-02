import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { scrollToTop } from '../utils/scrollToTop';
import ProfileCard from '../components/ProfileCard';
import PostCard from '../components/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

interface ProfileProps {
  userId?: string;
  onBack?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ userId, onBack }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const targetUserId = userId || user?.id;
  const isOwnProfile = !userId || userId === user?.id;

  const fetchProfileData = async () => {
    if (!targetUserId) return;

    try {
      setError('');
      const [profileData, postsData] = await Promise.all([
        api.getUserProfile(targetUserId),
        api.getUserPosts(targetUserId)
      ]);

      setProfile(profileData);
      setPosts(postsData);
    } catch (error: any) {
      setError('Failed to load profile data. Please try again.');
      console.error('Failed to fetch profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (targetUserId) {
      setIsLoading(true);
      scrollToTop(); // Scroll to top when Profile page loads
      fetchProfileData();
    }
  }, [targetUserId]);

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts(posts.filter(post => post.id !== deletedPostId));
  };

  const handleProfileUpdated = (updatedProfile: any) => {
    setProfile(updatedProfile);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Profile not found</p>
            {onBack && (
              <button
                onClick={onBack}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Go back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 mb-6 text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Feed</span>
          </button>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => {
                scrollToTop('smooth');
                fetchProfileData();
              }}
              className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
            >
              Try again
            </button>
          </div>
        )}

        <div className="space-y-8">
          <ProfileCard
            profile={profile}
            isOwnProfile={isOwnProfile}
            onProfileUpdated={handleProfileUpdated}
          />

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {isOwnProfile ? 'Your Posts' : `${profile.name}'s Posts`}
              </h2>
              <span className="text-sm text-gray-500">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </span>
            </div>

            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
                  <p className="text-gray-600">
                    {isOwnProfile 
                      ? "You haven't posted anything yet. Share your first post!" 
                      : "This user hasn't posted anything yet."
                    }
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;