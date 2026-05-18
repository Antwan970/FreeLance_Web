import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import '../styles/Admin.css';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAdminData();
  }, [token]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verify admin access
      const dashboardResponse = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: {
          'x-auth-token': token,
        },
      });

      if (dashboardResponse.status === 403) {
        setError('❌ You do not have admin access. Contact administrator for access.');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (!dashboardResponse.ok) {
        throw new Error('Failed to fetch admin data');
      }

      const dashboardData = await dashboardResponse.json();
      setStats(dashboardData.stats);
      setIsAdmin(true);

      // Fetch all users
      const usersResponse = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'x-auth-token': token,
        },
      });

      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      const usersData = await usersResponse.json();
      setUsers(usersData.users || []);

      // Track admin login
      await fetch(`${API_BASE_URL}/admin/login-track`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
      });
    } catch (err) {
      setError(err.message);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading admin panel...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-container">
        <div className="error-message">{error || 'Admin access required'}</div>
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-message">{error}</div>
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Panel</h1>
      <p className="admin-subtitle">Welcome, {user?.name}</p>

      {/* Statistics */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Active Users</h3>
            <p className="stat-number">{stats.activeUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Job Seekers</h3>
            <p className="stat-number">{stats.jobseekers}</p>
          </div>
          <div className="stat-card">
            <h3>Employers</h3>
            <p className="stat-number">{stats.employers}</p>
          </div>
          <div className="stat-card">
            <h3>Users Logged In</h3>
            <p className="stat-number">{stats.usersWithLogins}</p>
          </div>
          <div className="stat-card">
            <h3>Never Logged In</h3>
            <p className="stat-number">{stats.neverLoggedIn}</p>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="users-section">
        <h2>Registered Users ({users.length})</h2>
        
        {users.length === 0 ? (
          <p className="no-users">No users registered yet</p>
        ) : (
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th>Last Login</th>
                  <th>Login Count</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="user-name">{user.name}</td>
                    <td className="user-email">{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role === 'jobseeker' ? 'Job Seeker' : 'Employer'}
                      </span>
                    </td>
                    <td className="date">
                      {new Date(user.registeredAt).toLocaleDateString()} <br />
                      <small>{new Date(user.registeredAt).toLocaleTimeString()}</small>
                    </td>
                    <td className="date">
                      {user.lastLogin ? (
                        <>
                          {new Date(user.lastLogin).toLocaleDateString()} <br />
                          <small>{new Date(user.lastLogin).toLocaleTimeString()}</small>
                        </>
                      ) : (
                        <span className="never-logged">Never</span>
                      )}
                    </td>
                    <td className="login-count">
                      <span className="badge">{user.loginCount}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <button className="refresh-btn" onClick={fetchAdminData}>
        🔄 Refresh Data
      </button>
    </div>
  );
}
