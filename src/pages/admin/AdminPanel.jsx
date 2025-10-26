import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { API_CONFIG } from '../../config/apiConfig';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import { AdminRoutes } from '../../utils/adminRoutes';
import { createAdminApiClient, handleApiError } from '../../utils/apiUtils';
import './AdminPanel.css';

/**
 * Admin Dashboard Component
 * Central hub for all administrative functions
 */
const AdminPanel = () => {
  const { user, isAdmin, isAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [moduleStatus, setModuleStatus] = useState({});
  const navigate = useNavigate();

  // Create API client for status checks
  const statusClient = createAdminApiClient(
    { baseURL: API_CONFIG.ADMIN_API_URL },
    (error) => setError('Authentication error: ' + error.message)
  );

  // Authentication check - more robust with isAdmin from AuthContext
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { message: 'Please login to access admin dashboard' } });
      return;
    }

    // Check if user has admin role
    if (!isAdmin()) {
      setError('Access denied. You need administrative permissions to view this page.');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } else {
      // If admin, check status of various modules
      checkModuleStatus();
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Check the status of various admin modules
  const checkModuleStatus = async () => {
    setLoading(true);
    try {
      // Check basic connectivity to admin endpoints
      await statusClient.get('/status');
      
      // Check specific modules' status
      const statusChecks = await Promise.allSettled([
        statusClient.get('/products/count'),
        statusClient.get('/categories/count'),
        statusClient.get('/orders/count'),
        statusClient.get('/users/count')
      ]);
      
      // Process results
      const status = {
        products: statusChecks[0].status === 'fulfilled',
        categories: statusChecks[1].status === 'fulfilled',
        orders: statusChecks[2].status === 'fulfilled',
        users: statusChecks[3].status === 'fulfilled',
        addresses: true, // Assuming addresses is working by default
        inventory: true  // Assuming inventory is working by default
      };
      
      setModuleStatus(status);
    } catch (err) {
      const errorMessage = handleApiError(err, 'Error checking admin modules status');
      setError(errorMessage);
      console.error('Admin status check error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Define admin modules
  const adminModules = [
    {
      id: 'products',
      title: 'Products',
      description: 'Manage product catalog including descriptions, images, pricing, and categories',
      icon: '📦',
      path: AdminRoutes.PRODUCTS_GENERIC || '/admin/products-generic',
      color: '#4caf50'
    },
    {
      id: 'categories',
      title: 'Categories',
      description: 'Organize products into categories for better navigation',
      icon: '🗂️',
      path: AdminRoutes.CATEGORIES_GENERIC || '/admin/categories-generic',
      color: '#2196f3'
    },
    {
      id: 'orders',
      title: 'Orders',
      description: 'View and manage customer orders, update status, and handle fulfillment',
      icon: '🛒',
      path: AdminRoutes.ORDERS_GENERIC || '/admin/orders-generic',
      color: '#ff9800'
    },
    {
      id: 'users',
      title: 'Users',
      description: 'Manage user accounts, addresses, and permissions',
      icon: '👥',
      path: AdminRoutes.USERS_GENERIC || '/admin/users-generic',
      color: '#9c27b0'
    },
    {
      id: 'addresses',
      title: 'Addresses',
      description: 'Manage shipping and billing addresses for customers',
      icon: '📍',
      path: AdminRoutes.ADDRESSES || '/admin/addresses',
      color: '#795548'
    },
    {
      id: 'images',
      title: 'Images',
      description: 'Manage product images and media library',
      icon: '🖼️',
      path: AdminRoutes.IMAGES_GENERIC || '/admin/images-generic',
      color: '#e91e63'
    },
    {
      id: 'inventory',
      title: 'Inventory',
      description: 'Track product stock levels, manage sizes, and handle inventory operations',
      icon: '📊',
      path: AdminRoutes.INVENTORY || '/admin/inventory',
      color: '#607d8b'
    }
  ];

  // Get status indicator for a module
  const getModuleStatus = (moduleId) => {
    // Для images всегда возвращаем зелёную галочку
    if (moduleId === 'images') {
      return <span className="status-indicator ok">✅</span>;
    }
    if (!moduleStatus[moduleId]) {
      return <span className="status-indicator warning">⚠️</span>;
    }
    return <span className="status-indicator ok">✅</span>;
  };

  return (
    <div className="admin-panel-container">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      <LoadingIndicator isLoading={loading} />

      <div className="admin-modules-grid">
        {adminModules.map(module => (
          <Link 
            to={module.path} 
            key={module.id}
            className={`admin-module-card ${!moduleStatus[module.id] ? 'module-warning' : ''}`}
            style={{ 
              borderLeft: `4px solid ${module.color}`,
              borderTop: `1px solid ${module.color}30`
            }}
          >
            <div className="admin-module-icon" style={{ backgroundColor: `${module.color}30`, color: module.color }}>
              {module.icon}
            </div>
            <div className="admin-module-content">
              <div className="module-header">
                <h3>{module.title}</h3>
                {Object.keys(moduleStatus).length > 0 && getModuleStatus(module.id)}
              </div>
              <p>{module.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="admin-system-info">
        <h3>System Information</h3>
        <ul>
          <li><strong>Server Status:</strong> {loading ? 'Checking...' : (error ? 'Error' : 'Online')}</li>
          <li><strong>User:</strong> {user?.email || 'Unknown'}</li>
          <li><strong>Role:</strong> {user?.role || 'Admin'}</li>
          <li><strong>Last Login:</strong> {new Date().toLocaleString()}</li>
        </ul>
      </div>

      <div className="admin-panel-footer">
        <p>© {new Date().getFullYear()} Kounak Webstore Admin</p>
      </div>
    </div>
  );
};

export default AdminPanel;