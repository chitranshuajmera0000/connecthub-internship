import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    bio?: string;
  };
}

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
  onAuthorClick?: (authorId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted, onAuthorClick }) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.deletePost(post.id);
      onPostDeleted?.(post.id);
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwnPost = user?.id === post.author.id;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
      {/* Post Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1 min-w-0">
            <button
              onClick={() => onAuthorClick?.(post.author.id)}
              className="group"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg ${getAvatarColor(post.author.name)} shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105`}>
                {getInitials(post.author.name)}
              </div>
            </button>
            
            <div className="flex-1 min-w-0">
              <button
                onClick={() => onAuthorClick?.(post.author.id)}
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate block max-w-full text-left text-lg"
              >
                {post.author.name}
              </button>
              
              {post.author.bio && (
                <p className="text-sm text-gray-600 line-clamp-2 mt-1 leading-relaxed">{post.author.bio}</p>
              )}
              
              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
                <span>{formatDate(post.createdAt)}</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <span>🌐</span>
                  <span>Public</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isOwnPost && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                title="Delete post"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-5 pb-6">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-[15px]">
          {post.content}
        </p>
      </div>
    </div>
  );
};

export default PostCard;