import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { enableAdminAccount, findAdminAccounts } from '../../utils/adminUtils';
import axios from 'axios';

const AdminDebugger = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const [adminUsers, setAdminUsers] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [endpoints, setEndpoints] = useState([
    { name: 'Categories', url: '/api/admin/categories', status: 'Not tested' },
    { name: 'Products', url: '/api/admin/products', status: 'Not tested' },
    { name: 'Orders', url: '/api/admin/orders', status: 'Not tested' },
    { name: 'Users', url: '/api/admin/users', status: 'Not tested' },
    { name: 'Addresses', url: '/api/admin/addresses', status: 'Not tested' }
  ]);

  // Fetch admin users when component mounts
  useEffect(() => {
    if (isAdmin()) {
      fetchAdminUsers();
    }
  }, [isAdmin]);

  const fetchAdminUsers = async () => {
    try {
      setStatus('loading');
      const admins = await findAdminAccounts();
      setAdminUsers(admins);
      setStatus('success');
      setMessage('Successfully fetched admin accounts');
    } catch (error) {
      setStatus('error');
      setMessage(`Error fetching admin accounts: ${error.message}`);
    }
  };

  const handleEnableAdmin = async () => {
    if (!selectedAdminId) {
      setStatus('error');
      setMessage('Please select an admin account first');
      return;
    }

    try {
      setStatus('loading');
      await enableAdminAccount(selectedAdminId);
      setStatus('success');
      setMessage(`Admin account with ID ${selectedAdminId} has been enabled`);
      
      // Refresh the admin list
      await fetchAdminUsers();
    } catch (error) {
      setStatus('error');
      setMessage(`Error enabling admin account: ${error.message}`);
    }
  };

  const testEndpoint = async (index) => {
    const endpoint = endpoints[index];
    const updatedEndpoints = [...endpoints];
    
    try {
      updatedEndpoints[index].status = 'Testing...';
      setEndpoints(updatedEndpoints);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get(`http://localhost:8080${endpoint.url}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      updatedEndpoints[index].status = 'Success';
      updatedEndpoints[index].response = response.data;
      setEndpoints(updatedEndpoints);
    } catch (error) {
      let errorMessage = 'Unknown error';
      
      if (error.response) {
        errorMessage = `${error.response.status}: ${error.response.statusText}`;
        if (error.response.data && error.response.data.message) {
          errorMessage += ` - ${error.response.data.message}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      updatedEndpoints[index].status = `Failed: ${errorMessage}`;
      setEndpoints(updatedEndpoints);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="admin-debugger" style={{ padding: '20px' }}>
        <h1>Admin Debugger</h1>
        <div className="error-message" style={{ color: 'red', marginTop: '20px' }}>
          <p>You must be logged in with an admin account to use this tool.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-debugger" style={{ padding: '20px' }}>
      <h1>Admin Debugger</h1>
      
      {/* Current user info */}
      <div className="user-info" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h2>Current User Information</h2>
        <p><strong>ID:</strong> {user?.id}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>Admin:</strong> {isAdmin() ? 'Yes' : 'No'}</p>
      </div>
      
      {/* Admin accounts section */}
      <div className="admin-accounts" style={{ marginTop: '20px' }}>
        <h2>Admin Accounts</h2>
        <button 
          onClick={fetchAdminUsers}
          style={{ padding: '8px 15px', marginRight: '10px' }}
        >
          Refresh Admin List
        </button>
        
        {status === 'loading' && <p>Loading...</p>}
        
        {adminUsers.length > 0 ? (
          <div style={{ marginTop: '15px' }}>
            <select 
              value={selectedAdminId} 
              onChange={(e) => setSelectedAdminId(e.target.value)}
              style={{ padding: '8px', marginRight: '10px' }}
            >
              <option value="">Select Admin Account</option>
              {adminUsers.map(admin => (
                <option key={admin.id} value={admin.id}>
                  {admin.email} (ID: {admin.id}, Enabled: {admin.enabled ? 'Yes' : 'No'})
                </option>
              ))}
            </select>
            
            <button 
              onClick={handleEnableAdmin}
              disabled={!selectedAdminId}
              style={{ padding: '8px 15px' }}
            >
              Enable Selected Admin
            </button>
          </div>
        ) : (
          status !== 'loading' && <p>No admin accounts found</p>
        )}
      </div>
      
      {/* Message display */}
      {message && (
        <div 
          className={`message ${status}`} 
          style={{ 
            marginTop: '20px',
            padding: '10px 15px',
            borderRadius: '4px',
            backgroundColor: status === 'success' ? '#d4edda' : status === 'error' ? '#f8d7da' : '#e2e3e5',
            color: status === 'success' ? '#155724' : status === 'error' ? '#721c24' : '#383d41'
          }}
        >
          {message}
        </div>
      )}
      
      {/* API Endpoint Testing */}
      <div className="endpoint-testing" style={{ marginTop: '30px' }}>
        <h2>API Endpoint Testing</h2>
        <p>Click the "Test" button for each endpoint to verify access:</p>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Endpoint</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>URL</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((endpoint, index) => (
              <tr key={index}>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{endpoint.name}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{endpoint.url}</td>
                <td 
                  style={{ 
                    padding: '10px', 
                    borderBottom: '1px solid #ddd',
                    color: endpoint.status === 'Success' ? 'green' : 
                          endpoint.status.startsWith('Failed') ? 'red' : 'black'
                  }}
                >
                  {endpoint.status}
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  <button 
                    onClick={() => testEndpoint(index)}
                    style={{ padding: '5px 10px' }}
                  >
                    Test
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Response data display */}
      <div className="response-data" style={{ marginTop: '30px' }}>
        <h2>Response Data</h2>
        {endpoints.some(e => e.response) ? (
          endpoints.filter(e => e.response).map((endpoint, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <h3>{endpoint.name} Response:</h3>
              <pre 
                style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '15px',
                  borderRadius: '5px',
                  overflowX: 'auto'
                }}
              >
                {JSON.stringify(endpoint.response, null, 2)}
              </pre>
            </div>
          ))
        ) : (
          <p>No responses available. Test an endpoint to see its response.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDebugger;