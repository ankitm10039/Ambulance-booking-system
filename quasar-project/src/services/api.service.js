import axios from 'axios';

// Create axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Function to set auth token
const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Token set:', token);
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    console.log('Token removed');
  }
};

export { apiClient, setAuthToken };