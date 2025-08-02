import React, { useState, useEffect } from 'react';
import { RefreshCw, Users } from 'lucide-react';
import { scrollToTop } from '../utils/scrollToTop';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { PostSkeleton } from '../components/LoadingSkeleton';
import { api } from '../utils/api';

interface HomeProps {
  onUserClick: (userId: string) => void;
}

const Home: React.FC<HomeProps> = ({ onUserClick }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async (useCache: boolean = true) => {
    try {
      setError('');
      const fetchedPosts = await api.getPosts(useCache);
      setPosts(fetchedPosts);
    } catch (error: any) {
      setError('Failed to load posts. Please try again.');
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPosts = async () => {
    setIsLoading(true);
    await fetchPosts(false); // Skip cache for manual refresh
  };

  useEffect(() => {
    fetchPosts();
    scrollToTop(); // Scroll to top when Home page loads
  }, []);

  const handlePostCreated = (newPost: any) => {
    setPosts([newPost, ...posts]);
    // Smooth scroll to top to show the new post
    setTimeout(() => scrollToTop('smooth'), 100);
  };

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts(posts.filter(post => post.id !== deletedPostId));
  };

  const handleRefresh = () => {
    setIsLoading(true);
    scrollToTop('smooth'); // Smooth scroll to top when refreshing
    fetchPosts();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Community Feed</h1>
                  <p className="text-gray-600">Loading posts...</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Community Feed</h1>
                <p className="text-gray-600 mt-1">Discover what's happening in your network</p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="font-medium">Refresh</span>
            </button>
          </div>

          <CreatePost onPostCreated={handlePostCreated} />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => fetchPosts()}
              className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
            >
              Try again
            </button>
          </div>
        )}

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No posts yet</h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                Be the first to share something with the community and start meaningful conversations!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostDeleted={handlePostDeleted}
                onAuthorClick={onUserClick}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;