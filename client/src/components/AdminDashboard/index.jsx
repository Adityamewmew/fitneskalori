import { useState, useEffect } from 'react';
import API_BASE from '../../config';
import './styles.css';

export default function AdminDashboard({ token }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [tab, setTab] = useState('pending'); // 'pending' | 'active'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const pendingRes = await fetch(`${API_BASE}/api/admin/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const activeRes = await fetch(`${API_BASE}/api/admin/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const pData = await pendingRes.json();
      const aData = await activeRes.json();
      
      if (pData.success) setPendingUsers(pData.data);
      if (aData.success) setActiveUsers(aData.data);
    } catch (e) {
      console.error(e);
    }
  };

  const approveUser = async (id) => {
    try {
      await fetch(`${API_BASE}/api/admin/approve/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`${API_BASE}/api/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="admin-container">
      <div className="tabs">
        <button 
            className={`tab ${tab === 'pending' ? 'active' : ''}`} 
            onClick={() => setTab('pending')}
        >
            Pending ({pendingUsers.length})
        </button>
        <button 
            className={`tab ${tab === 'active' ? 'active' : ''}`} 
            onClick={() => setTab('active')}
        >
            Active ({activeUsers.length})
        </button>
      </div>

      <div className="card">
        {tab === 'pending' && (
            <div className="user-list">
              {pendingUsers.length === 0 ? <p className="empty-state">Tidak ada user pending.</p> : null}
              {pendingUsers.map(u => (
                <div key={u.id} className="user-item">
                  <div>
                    <strong>{u.full_name || 'No Name'}</strong>
                    <div className="text-sm">{u.email}</div>
                  </div>
                  <button className="primary" onClick={() => handleApprove(u.id)}>Approve</button>
                </div>
              ))}
            </div>
        )}

        {tab === 'active' && (
            <div className="user-list">
              {activeUsers.length === 0 ? <p className="empty-state">Tidak ada user aktif.</p> : null}
              {activeUsers.map(u => (
                <div key={u.id} className="user-item">
                  <div>
                    <strong>{u.full_name || 'No Name'}</strong>
                    <div className="text-sm">{u.email}</div>
                  </div>
                  <button onClick={() => handleDelete(u.id)} style={{color: '#991B1B', borderColor: '#FCA5A5'}}>Delete</button>
                </div>
              ))}
            </div>
        )}
      </div>
    </div>
  );
}
