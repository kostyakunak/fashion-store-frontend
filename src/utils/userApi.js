import axios from 'axios';

export const getUserByEmail = async (email) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    `http://localhost:8080/api/users/email/${email}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data; // { id, email, ... }
}; 