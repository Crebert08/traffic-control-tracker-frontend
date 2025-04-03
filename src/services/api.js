import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Marker services
export const markerService = {
  getMarkers: async () => {
    const response = await api.get('/markers');
    return response.data;
  },
  
  createMarker: async (markerData) => {
    const response = await api.post('/markers', markerData);
    return response.data;
  },
  
  updateMarker: async (id, markerData) => {
    const response = await api.put(`/markers/${id}`, markerData);
    return response.data;
  },
  
  deleteMarker: async (id) => {
    const response = await api.delete(`/markers/${id}`);
    return response.data;
  }
};

// Location services
export const locationService = {
  saveLocation: async (locationData) => {
    const response = await api.post('/locations', locationData);
    return response.data;
  },
  
  getLocationHistory: async (deviceId) => {
    const response = await api.get(`/locations/${deviceId}`);
    return response.data;
  },
  
  getLatestLocations: async () => {
    const response = await api.get('/locations');
    return response.data;
  }
};

export default {
  markerService,
  locationService
};