import { useState, useEffect } from 'react';
import AuthLayout from './components/AuthLayout';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import { supabase } from './supabaseClient';

function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      // Use API call to our backend instead of direct supabase if possible,
      // but since we have token we can fetch from profiles easily
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (!error && data) {
        setUserProfile(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="app-container"><p>Loading...</p></div>;
  }

  if (!session) {
    return <div className="app-container"><AuthLayout /></div>;
  }

  if (!userProfile?.is_approved && !userProfile?.is_admin) {
    return (
      <div className="app-container">
        <div className="card">
          <h2>Account Pending Approval</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '16px' }}>Your account is waiting for an admin to approve it.</p>
          <button onClick={handleLogout}>Log Out</button>
        </div>
      </div>
    );
  }



  return (
    <div className="app-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 10px' }}>
        <div>
          <h1 style={{fontSize: '1.1rem', margin: 0, textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px', color: 'var(--text-primary)'}}>{userProfile?.full_name || 'MY_LAB'}</h1>
          <span style={{color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: '500'}}>{userProfile?.email}</span>
        </div>
        <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
          <button onClick={handleLogout} style={{fontSize: '0.75rem', padding: '8px 16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: '700', border: '1px solid rgba(239, 68, 68, 0.2)'}}>Logout</button>
        </div>
      </header>
      
      {userProfile?.is_admin ? (
        <div style={{padding: '0 24px'}}><AdminDashboard token={session.access_token} /></div>
      ) : (
        <UserDashboard token={session.access_token} userId={session.user.id} />
      )}
    </div>
  );
}

export default App;
