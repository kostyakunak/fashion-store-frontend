import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { handleApiError } from '../utils/apiUtils';

/**
 * Custom hook for admin pages that provides state management and CRUD operations
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.fetchAll - Function to fetch all entities
 * @param {Function} options.createEntity - Function to create a new entity
 * @param {Function} options.updateEntity - Function to update an existing entity
 * @param {Function} options.deleteEntity - Function to delete an entity
 * @param {string} options.entityName - Name of the entity (e.g., "product", "category")
 * @returns {Object} State and methods for managing admin entities
 */
const useAdmin = ({
  fetchAll,
  createEntity,
  updateEntity,
  deleteEntity,
  entityName = 'item'
}) => {
  console.log('🔄 useAdmin render start', { entityName, timestamp: Date.now() });
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { isAdmin, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  console.log('🔄 useAdmin state:', { 
    itemsCount: items.length, 
    loading, 
    hasLoaded, 
    error: !!error 
  });

  /**
   * Load all items
   */
  const loadItems = useCallback(async () => {
    console.log('📥 loadItems called', { 
      hasLoaded, 
      loading, 
      timestamp: Date.now() 
    });
    
    if (hasLoaded) {
      console.log('⏭️ loadItems skipped - already loaded');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🌐 calling fetchAll...');
      const data = await fetchAll();
      console.log('✅ fetchAll result:', { 
        dataLength: data?.length || 0, 
        timestamp: Date.now() 
      });
      setItems(data);
      setHasLoaded(true);
      console.log('✅ loadItems completed successfully');
    } catch (error) {
      const errorMessage = handleApiError(error, `Failed to load ${entityName}s`);
      setError(errorMessage);
      console.error('❌ Error fetching items:', error);
    } finally {
      setLoading(false);
      console.log('🏁 loadItems finished');
    }
  }, [fetchAll, entityName, hasLoaded]);

  // Check authentication and admin status
  useEffect(() => {
    console.log('🔐 Auth check useEffect triggered', {
      isAuthenticated: isAuthenticated(),
      isAdmin: isAdmin(),
      timestamp: Date.now()
    });
    
    if (!isAuthenticated()) {
      console.log('❌ Not authenticated, redirecting to login');
      navigate('/login', { state: { message: 'Please login to access admin pages' } });
      return;
    }
    
    if (!isAdmin()) {
      console.log('❌ Not admin, setting error');
      setError('You do not have permission to access this page');
      setTimeout(() => navigate('/'), 2000);
    }
  }, [isAdmin, isAuthenticated, navigate]);

  // Initial data fetch
  useEffect(() => {
    const isAuth = isAuthenticated();
    const isAdminUser = isAdmin();
    
    console.log('📊 Data fetch useEffect triggered', {
      isAuth,
      isAdminUser,
      hasLoaded,
      loading,
      timestamp: Date.now()
    });
    
    if (isAuth && isAdminUser && !hasLoaded) {
      console.log('🚀 Starting data load...');
      loadItems();
    } else {
      console.log('⏭️ Data fetch skipped', {
        reason: !isAuth ? 'not authenticated' : 
                !isAdminUser ? 'not admin' : 
                hasLoaded ? 'already loaded' : 'unknown'
      });
    }
  }, [isAuthenticated, isAdmin, loadItems, hasLoaded]);

  /**
   * Create a new item
   * @param {Object} data - Data for the new item
   * @returns {Promise<Object>} The created item
   */
  const create = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      // Remove ID if present (for server-side auto-generation)
      const { id, ...dataWithoutId } = data;
      
      const result = await createEntity(dataWithoutId);
      setItems(prevItems => [...prevItems, result]);
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error, `Failed to create ${entityName}`);
      setError(errorMessage);
      console.error(`Error creating ${entityName}:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing item
   * @param {number|string} id - ID of the item to update
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} The updated item
   */
  const update = async (id, data) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await updateEntity(id, data);
      
      // Update the item in the state
      setItems(prevItems => 
        prevItems.map(item => item.id === id ? result : item)
      );
      
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error, `Failed to update ${entityName}`);
      setError(errorMessage);
      console.error(`Error updating ${entityName}:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete an item
   * @param {number|string} id - ID of the item to delete
   * @returns {Promise<boolean>} Success indicator
   */
  const remove = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteEntity(id);
      
      // Remove the item from the state
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      
      return true;
    } catch (error) {
      const errorMessage = handleApiError(error, `Failed to delete ${entityName}`);
      setError(errorMessage);
      console.error(`Error deleting ${entityName}:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => setError(null);

  /**
   * Reset state and reload items
   */
  const reset = () => {
    setItems([]);
    setError(null);
    loadItems();
  };

  // API client object for GenericTableManager component
  const apiClient = useMemo(() => {
    console.log('🔧 apiClient useMemo triggered', { timestamp: Date.now() });
    
    return {
      getAll: fetchAll ? async () => {
        console.log('🌐 apiClient.getAll called');
        // Don't set loading here - let the component handle it
        try {
          const data = await fetchAll();
          console.log('✅ apiClient.getAll result:', { dataLength: data?.length || 0 });
          return data;
        } catch (error) {
          const errorMessage = handleApiError(error, `Failed to load ${entityName}s`);
          setError(errorMessage);
          console.error('❌ apiClient.getAll error:', error);
          return [];
        }
      } : null,
      create: createEntity ? create : null,
      update: updateEntity ? update : null,
      delete: deleteEntity ? remove : null
    };
  }, [fetchAll, createEntity, updateEntity, deleteEntity, create, update, remove, entityName]);

  return {
    items,
    loading,
    error,
    loadItems,
    create,
    update,
    remove,
    clearError,
    reset,
    apiClient
  };
};

export default useAdmin;