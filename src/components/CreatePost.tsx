import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { api } from '../utils/api';

interface CreatePostProps {
  onPostCreated: (post: any) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { showToast } = useToast();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }

    if (content.length > 1000) {
      setError('Post content must be less than 1000 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newPost = await api.createPost(content.trim());
      onPostCreated(newPost);
      setContent('');
      showToast('Post created successfully!', 'success');
    } catch (error: any) {
      setError(error.message || 'Failed to create post');
      showToast('Failed to create post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-full">
          <MessageSquare className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Share an update</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share your thoughts, insights, or experiences with the community..."
            className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-[15px] leading-relaxed"
            disabled={isSubmitting}
          />
          
          <div className="flex justify-between items-center mt-3">
            <span className={`text-sm font-medium ${content.length > 900 ? 'text-red-500' : 'text-gray-500'}`}>
              {content.length}/1000 characters
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim() || content.length > 1000}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Posting...' : 'Share Post'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;