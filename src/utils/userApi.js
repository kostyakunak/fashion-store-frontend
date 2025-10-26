import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

export const getUserByEmail = async (email) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    `${API_CONFIG.API_URL}/users/email/${email}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data; // { id, email, ... }
}; 