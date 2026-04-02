import React, { useState, useEffect } from 'react';
import API_BASE from '../../config';
import './styles.css';

const AdminDashboard = ({ token, onLogout }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [tab, setTab] = useState('pending'); // 'pending' | 'active'

  const fetchData = async () => {
    try {
      const [pendingRes, activeRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/pending`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/active`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const pData = await pendingRes.json();
      const aData = await activeRes.json();
      
      if (pData.success) setPendingUsers(pData.data);
      if (aData.success) setActiveUsers(aData.data);
    } catch (e) {
      console.error('Fetch Admin Errors:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/approve/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus user ini?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>SUPER ADMIN</h1>
          <p>admin@fitness.com</p>
        </div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>

      <div className="admin-tabs">
        <button 
          className={tab === 'pending' ? 'active' : ''} 
          onClick={() => setTab('pending')}
        >
          Pending ({pendingUsers.length})
        </button>
        <button 
          className={tab === 'active' ? 'active' : ''} 
          onClick={() => setTab('active')}
        >
          Active ({activeUsers.length})
        </button>
      </div>

      <div className="user-list">
        {tab === 'pending' ? (
          pendingUsers.map(u => (
            <div key={u.id} className="user-card">
              <div className="user-info">
                <h3>{u.full_name}</h3>
                <p>{u.email}</p>
              </div>
              <div className="user-actions">
                <button className="approve-btn" onClick={() => handleApprove(u.id)}>Approve</button>
                <button className="delete-btn" onClick={() => handleDelete(u.id)}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          activeUsers.map(u => (
            <div key={u.id} className="user-card">
              <div className="user-info">
                <h3>{u.full_name}</h3>
                <p>{u.email}</p>
              </div>
              <button className="delete-btn" onClick={() => handleDelete(u.id)}>Delete Account</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
