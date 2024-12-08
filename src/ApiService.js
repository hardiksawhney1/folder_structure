import axios from 'axios';

const API_URL = 'http://localhost:5000/api/data';

export const fetchData = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const saveData = async (newData) => {
  try {
    const response = await axios.post(API_URL, newData);
    return response.data;
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
};
