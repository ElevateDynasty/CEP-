import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for model inference
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
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
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Prediction API
export const predictBreed = async (file, includeGradcam = false, includeBreedInfo = true) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('include_gradcam', includeGradcam);
  formData.append('include_breed_info', includeBreedInfo);

  return api.post('/predict', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const predictBreedBase64 = async (imageBase64, includeGradcam = false, includeBreedInfo = true) => {
  return api.post('/predict/base64', {
    image: imageBase64,
    include_gradcam: includeGradcam,
    include_breed_info: includeBreedInfo,
  });
};

// Breeds API
export const getBreeds = async (params = {}) => {
  return api.get('/breeds', { params });
};

export const getBreedById = async (breedId) => {
  return api.get(`/breeds/${breedId}`);
};

export const getBreedsByState = async (stateName) => {
  return api.get(`/breeds/state/${stateName}`);
};

export const getStates = async () => {
  return api.get('/states');
};

// Comparison API
export const compareBreeds = async (breed1, breed2) => {
  return api.get('/compare', {
    params: { breed1, breed2 },
  });
};

export const compareMultipleBreeds = async (breeds) => {
  return api.get('/compare/multi', {
    params: { breeds: breeds.join(',') },
  });
};

export const getSustainabilityRanking = async (animalType = null, limit = 10) => {
  return api.get('/sustainability-ranking', {
    params: { animal_type: animalType, limit },
  });
};

// Government Schemes API
export const getGovernmentSchemes = async () => {
  return api.get('/government-schemes');
};

export default api;
