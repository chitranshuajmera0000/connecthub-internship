import { cache, CACHE_KEYS, CACHE_TTL } from './cache';

// Force Vercel API deployment - updated
const API_BASE_URL = 'https://connecthub-internship.vercel.app/api';

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Posts
  getPosts: async (useCache: boolean = true) => {
    // Check cache first
    if (useCache) {
      const cachedPosts = cache.get(CACHE_KEYS.POSTS);
      if (cachedPosts) {
        console.log('📦 Serving posts from cache');
        return cachedPosts;
      }
    }

    console.log('🌐 Fetching posts from API');
    const response = await fetch(`${API_BASE_URL}/posts`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(data.error || 'Failed to fetch posts', response.status);
    }
    
    // Cache the result
    if (useCache) {
      cache.set(CACHE_KEYS.POSTS, data.posts, CACHE_TTL.POSTS);
    }
    
    return data.posts;
  },

  createPost: async (content: string) => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ content }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(data.error || 'Failed to create post', response.status);
    }
    
    // Invalidate relevant caches when creating new post
    cache.delete(CACHE_KEYS.POSTS);
    // Clear current user's posts cache (we don't have userId here, so we'll let it expire naturally)
    console.log('Posts cache cleared after creating new post');
    
    return data.post;
  },

  deletePost: async (postId: string) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new ApiError(data.error || 'Failed to delete post', response.status);
    }
    
    // Invalidate posts cache when deleting post
    cache.delete(CACHE_KEYS.POSTS);
    console.log('Posts cache cleared after deleting post');
  },

  // Users
  getUserProfile: async (userId: string) => {
    const cacheKey = `${CACHE_KEYS.USER_PROFILE}_${userId}`;
    
    // Check cache first
    if (cache.has(cacheKey)) {
      console.log('User profile loaded from cache');
      return cache.get(cacheKey);
    }
    
    console.log('Fetching user profile from API');
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(data.error || 'Failed to fetch user profile', response.status);
    }
    
    // Cache the result
    cache.set(cacheKey, data.user, CACHE_TTL.USER_PROFILE);
    
    return data.user;
  },

  getUserPosts: async (userId: string) => {
    const cacheKey = `${CACHE_KEYS.USER_POSTS(userId)}`;
    
    // Check cache first
    if (cache.has(cacheKey)) {
      console.log('User posts loaded from cache');
      return cache.get(cacheKey);
    }
    
    console.log('Fetching user posts from API');
    const response = await fetch(`${API_BASE_URL}/users/${userId}/posts`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(data.error || 'Failed to fetch user posts', response.status);
    }
    
    // Cache the result
    cache.set(cacheKey, data.posts, CACHE_TTL.USER_POSTS);
    
    return data.posts;
  },

  updateUserProfile: async (userId: string, profileData: { name: string; bio: string }) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(profileData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(data.error || 'Failed to update profile', response.status);
    }
    
    // Invalidate relevant caches when updating profile
    const userProfileKey = `${CACHE_KEYS.USER_PROFILE(userId)}`;
    cache.delete(userProfileKey);
    cache.delete(CACHE_KEYS.CURRENT_USER);
    console.log('Cache cleared after updating profile');
    
    return data.user;
  },
};

export { ApiError };