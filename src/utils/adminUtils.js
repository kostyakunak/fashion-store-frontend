import axios from 'axios';

/**
 * Utility functions for admin account management
 */

/**
 * Enables an admin account by ID
 * 
 * @param {number} userId - The ID of the admin user to enable
 * @returns {Promise<Object>} The updated user data
 */
export const enableAdminAccount = async (userId) => {
  try {
    // Get the JWT token from local storage
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required. Please log in first.');
    }
    
    // Configure axios with the auth token
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    // First, get current user data
    const userResponse = await axios.get(
      `http://localhost:8080/api/admin/users/${userId}`, 
      config
    );
    
    const userData = userResponse.data;
    
    // Update the user to ensure enabled is true
    const updateResponse = await axios.put(
      `http://localhost:8080/api/admin/users/${userId}`,
      {
        ...userData,
        enabled: true
      },
      config
    );
    
    console.log('Admin account enabled successfully:', updateResponse.data);
    return updateResponse.data;
    
  } catch (error) {
    console.error('Error enabling admin account:', error);
    
    // Generate a helpful error message
    let errorMessage = 'Failed to enable admin account.';
    
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        errorMessage = 'Authentication error. Please log in with an account that has admin privileges.';
      } else if (error.response.status === 404) {
        errorMessage = 'User not found. Please check the user ID.';
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Lists all users to find admin accounts
 * 
 * @returns {Promise<Array>} List of users
 */
export const findAdminAccounts = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required. Please log in first.');
    }
    
    const response = await axios.get(
      'http://localhost:8080/api/admin/users',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Filter for admin accounts
    const adminUsers = response.data.filter(user => 
      user.role === 'ADMIN'
    );
    
    console.log('Found admin accounts:', adminUsers);
    return adminUsers;
    
  } catch (error) {
    console.error('Error finding admin accounts:', error);
    throw error;
  }
};