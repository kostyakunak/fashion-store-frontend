import axios from 'axios';

export const getUserByEmail = async (email) => {
  const response = await axios.get(`http://localhost:8080/api/users/email/${email}`);
  return response.data; // { id, email, ... }
}; 