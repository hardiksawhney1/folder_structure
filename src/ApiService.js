import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const fetchData = async () => {
  try {
    const response = await axios.get(`${API_URL}/data`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const addItem = async (path, type, name) => {
  try {
    console.log('Sending request to:', `${API_URL}/add`);
    console.log('Request data:', { path, type, name });
    
    const response = await axios.post(`${API_URL}/add`, { path, type, name });
    
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error details:', error.response || error);
    throw error.response?.data || error;
  }
};
