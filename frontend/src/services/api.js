import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for model inference
});

// Token management
const getToken = () => localStorage.getItem('authToken');
const setToken = (token) => localStorage.setItem('authToken', token);
const removeToken = () => localStorage.removeItem('authToken');

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth header if token exists
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized
      removeToken();
    }
    const message = error.response?.data?.detail || 
                    error.response?.data?.message || 
                    error.message || 
                    'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ==================== Authentication API ====================

export const register = async (userData) => {
  const response = await api.post('/users/register/', userData);
  if (response.token) {
    setToken(response.token);
  }
  return response;
};

export const login = async (email, password) => {
  const response = await api.post('/users/login/', { email, password });
  if (response.token) {
    setToken(response.token);
  }
  return response;
};

export const logout = async () => {
  try {
    await api.post('/users/logout/');
  } finally {
    removeToken();
  }
};

export const getProfile = async () => {
  return api.get('/users/profile/');
};

export const updateProfile = async (data) => {
  return api.patch('/users/profile/', data);
};

export const changePassword = async (oldPassword, newPassword) => {
  return api.post('/users/change-password/', {
    old_password: oldPassword,
    new_password: newPassword,
  });
};

export const getUserStats = async () => {
  return api.get('/users/stats/');
};

export const isAuthenticated = () => {
  return !!getToken();
};

// ==================== Prediction API ====================

export const predictBreed = async (file, includeGradcam = false, includeBreedInfo = true) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('include_gradcam', includeGradcam);
  formData.append('include_breed_info', includeBreedInfo);

  return api.post('/predict/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const predictBreedBase64 = async (imageBase64, includeGradcam = false, includeBreedInfo = true) => {
  return api.post('/predict/base64/', {
    image: imageBase64,
    include_gradcam: includeGradcam,
    include_breed_info: includeBreedInfo,
  });
};

export const getPrediction = async (predictionId) => {
  return api.get(`/predict/${predictionId}/`);
};

export const submitPredictionFeedback = async (predictionId, feedback) => {
  return api.patch(`/predict/${predictionId}/feedback/`, feedback);
};

export const getPredictionHistory = async () => {
  return api.get('/predict/history/');
};

export const getPredictionStats = async () => {
  return api.get('/predict/stats/');
};

export const getModelInfo = async () => {
  return api.get('/predict/model-info/');
};

// ==================== Breeds API ====================

export const getBreeds = async (params = {}) => {
  return api.get('/breeds/', { params });
};

export const getBreedById = async (breedId) => {
  return api.get(`/breeds/${breedId}/`);
};

export const getBreedsByState = async (stateName) => {
  return api.get(`/breeds/by-state/${stateName}/`);
};

export const getBreedStats = async () => {
  return api.get('/breeds/stats/');
};

export const getStates = async () => {
  return api.get('/states/');
};

// ==================== Comparison API ====================

export const compareBreeds = async (breed1, breed2) => {
  return api.post('/breeds/compare/', {
    breed_ids: [breed1, breed2],
  });
};

export const compareMultipleBreeds = async (breeds) => {
  return api.post('/breeds/compare/', {
    breed_ids: breeds,
  });
};

export const getPopularComparisons = async () => {
  return api.get('/breeds/popular-comparisons/');
};

// ==================== Favorites API ====================

export const getFavorites = async () => {
  return api.get('/users/favorites/');
};

export const addFavorite = async (breedId, notes = '') => {
  return api.post('/users/favorites/', { breed: breedId, notes });
};

export const removeFavorite = async (favoriteId) => {
  return api.delete(`/users/favorites/${favoriteId}/`);
};

// ==================== Saved Comparisons API ====================

export const getSavedComparisons = async () => {
  return api.get('/users/comparisons/');
};

export const saveComparison = async (breed1Id, breed2Id, notes = '') => {
  return api.post('/users/comparisons/', {
    breed_1: breed1Id,
    breed_2: breed2Id,
    notes,
  });
};

export const deleteSavedComparison = async (comparisonId) => {
  return api.delete(`/users/comparisons/${comparisonId}/`);
};

// ==================== Government Schemes API ====================

export const getGovernmentSchemes = async (params = {}) => {
  return api.get('/schemes/', { params });
};

export const getGovernmentScheme = async (schemeId) => {
  return api.get(`/schemes/${schemeId}/`);
};

// ==================== Analytics API ====================

export const getDashboardStats = async () => {
  return api.get('/analytics/dashboard/');
};

export const getBreedAnalytics = async (breedId = null) => {
  const url = breedId ? `/analytics/breeds/${breedId}/` : '/analytics/breeds/';
  return api.get(url);
};

export const getUserEngagement = async () => {
  return api.get('/analytics/engagement/');
};

export const getPopularBreeds = async (period = 7) => {
  return api.get('/analytics/popular/', { params: { period } });
};

// ==================== Feedback API ====================

export const submitFeedback = async (feedbackData) => {
  return api.post('/feedback/', feedbackData);
};

// ==================== Sustainability API ====================

export const getSustainabilityRanking = async (animalType = null, limit = 10) => {
  // Get breeds sorted by carbon score
  return api.get('/breeds/', {
    params: { 
      animal_type: animalType, 
      ordering: '-carbon_score',
      page_size: limit 
    },
  });
};

// ==================== Health Check ====================

export const healthCheck = async () => {
  return api.get('/health/');
};

export default api;
