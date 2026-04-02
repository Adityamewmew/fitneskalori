import { useState, useEffect } from 'react';
import CalorieForm from '../CalorieForm';
import WorkoutForm from '../WorkoutForm';
import API_BASE from '../../config';
import './styles.css';

const AccordionNode = ({ title, subtitle, children, openClass = false }) => {
    const [isOpen, setIsOpen] = useState(openClass);
    return (
        <div style={{marginBottom: '8px'}}>
            <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
                <div style={{display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center'}}>
                   <span>{title}</span>
                   <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                      {subtitle && <span style={{fontSize:'0.75rem', color:'var(--accent-color)'}}>{subtitle}</span>}
                      <span style={{fontSize:'0.6rem', color:'var(--text-secondary)'}}>{isOpen ? '▼' : '▶'}</span>
                   </div>
                </div>
            </div>
            {isOpen && <div className="accordion-content">{children}</div>}
        </div>
    );
};

export default function UserDashboard({ token }) {
  const [tab, setTab] = useState('dashboard');
  const [calories, setCalories] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  
  // Search query
  const [calSearchDate, setCalSearchDate] = useState('');
  const [workSearchDate, setWorkSearchDate] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('workout'); 
  const [graphModalType, setGraphModalType] = useState(null); // 'calorie' or 'training'
  
  // Streak & BB
  const [streakData, setStreakData] = useState({ streak: 0, checkedInToday: false });
  const [bodyWeight, setBodyWeight] = useState('65'); // Default example
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [userData, setUserData] = useState({});
  
  // Item Detail Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditingItem, setIsEditingItem] = useState(false);

  const handleDelete = async () => {
    if (!selectedItem || !window.confirm('Are you sure you want to delete this entry?')) return;
    
    const { type, data } = selectedItem;
    const endpoint = type === 'calorie' ? 'calories' : 'workouts';
    
    try {
      const res = await fetch(`${API_BASE}/api/tracking/${endpoint}/${data.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setSelectedItem(null);
        fetchData();
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      const [calRes, workRes, profRes] = await Promise.all([
        fetch(`${API_BASE}/api/tracking/calories`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/tracking/workouts`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/auth/profile`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const calJson = await calRes.json();
      const workJson = await workRes.json();
      const profJson = await profRes.json();

      if (calJson.success) setCalories(calJson.data);
      if (workJson.success) setWorkouts(workJson.data);
      if (profJson.success && profJson.data) {
          const profile = profJson.data;
          setUserData(profile);
          setBodyWeight(profile.weight_kg !== null ? profile.weight_kg.toString() : '65');
          const lastDate = profile.last_checkin; // e.g. 2026-04-02
          const streak = profile.streak_count || 0;
          
          if(lastDate) {
              const today = new Date().toISOString().split('T')[0];
              const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
              if (lastDate === today) {
                  setStreakData({ streak, checkedInToday: true });
              } else if (lastDate === yesterday) {
                  setStreakData({ streak, checkedInToday: false });
              } else {
                  setStreakData({ streak: 0, checkedInToday: false });
              }
          } else {
              setStreakData({ streak: 0, checkedInToday: false });
          }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async () => {
      if (streakData.checkedInToday) return;
      const newStreak = streakData.streak + 1;
      const todayStr = new Date().toISOString().split('T')[0];
      setStreakData({ streak: newStreak, checkedInToday: true });
      
      try {
         await fetch('http://localhost:5000/api/auth/profile/update', {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
             body: JSON.stringify({ streak_count: newStreak, last_checkin: todayStr })
         });
      } catch(e) { console.error('Failed to sync checkin', e); }
  };

  const handleSaveWeight = async (e) => {
      e.stopPropagation(); // Biar ga trigger modal expand grafik
      if(weightInput.trim()) {
         const numWeight = parseFloat(weightInput);
         setBodyWeight(weightInput);
         setIsEditingWeight(false);
         try {
             await fetch('http://localhost:5000/api/auth/profile/update', {
                 method: 'PUT',
                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                 body: JSON.stringify({ weight_kg: numWeight })
             });
         } catch(e) { console.error('Failed to sync weight'); }
      }
  };

  const now = new Date();
  const isToday = (dateStr) => new Date(dateStr).toDateString() === now.toDateString();

  const todaysCalories = calories.filter(c => isToday(c.created_at));
  const todaysWorkouts = workouts.filter(w => isToday(w.created_at));

  const totalCalories = todaysCalories.reduce((sum, item) => sum + parseFloat(item.calories || 0), 0);
  const totalBurned = todaysWorkouts.filter(w => w.type === 'cardio').reduce((sum, item) => sum + parseFloat(item.calories_burned || 0), 0);

  const targetCalories = 2400;
  const calPercent = Math.min(100, Math.round((totalCalories / targetCalories) * 100));

  const getAverageCalories = (days) => {
      const msInDays = days * 24 * 60 * 60 * 1000;
      const recent = calories.filter(c => (now - new Date(c.created_at)) < msInDays);
      const sum = recent.reduce((acc, curr) => acc + parseFloat(curr.calories || 0), 0);
      return Math.round(sum / days) || 0;
  };
  
  const dailyAvg = totalCalories;
  const weeklyAvg = getAverageCalories(7);
  const monthlyAvg = getAverageCalories(30);
  const maxGraphVal = Math.max(dailyAvg, weeklyAvg, monthlyAvg, 1);

  const getWeekOfMonth = (date) => {
      const d = new Date(date);
      const dateNum = d.getDate();
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
      let firstDayOfWeek = firstDay.getDay() - 1;
      if (firstDayOfWeek === -1) firstDayOfWeek = 6; // Make Monday=0
      return Math.ceil((dateNum + firstDayOfWeek) / 7);
  };

  // Grouping logic for Accordion
  const groupDataList = (dataList, searchDateString) => {
      let filtered = dataList;
      if (searchDateString) {
          filtered = dataList.filter(item => {
             return new Date(item.created_at).toISOString().split('T')[0] === searchDateString;
          });
      }

      const groups = {};
      filtered.forEach(item => {
         const d = new Date(item.created_at);
         const yearMonth = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
         const weekStr = `Week ${getWeekOfMonth(d)}`;
         const dayStr = d.toDateString();

         if (!groups[yearMonth]) groups[yearMonth] = {};
         if (!groups[yearMonth][weekStr]) groups[yearMonth][weekStr] = {};
         if (!groups[yearMonth][weekStr][dayStr]) groups[yearMonth][weekStr][dayStr] = [];

         groups[yearMonth][weekStr][dayStr].push(item);
      });
      return groups;
  };

  const getTotals = (items, type) => {
      if (type === 'calorie') {
          const total = items.reduce((sum, it) => sum + parseFloat(it.calories || 0), 0);
          return `${total} KCAL`;
      }
      return `${items.length} SESSIONS`;
  };

  const renderGroupedList = (dataList, type, searchDate) => {
      const groups = groupDataList(dataList, searchDate);
      if (Object.keys(groups).length === 0) return <div className="empty-text">No records found.</div>;
      
      const currentMonthStr = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      const currentWeekStr = `Week ${getWeekOfMonth(now)}`;

      return Object.entries(groups).map(([month, weeks]) => {
          const isPastMonth = month !== currentMonthStr;
          
          let monthItems = []; // Collect items for the month total

          const monthContent = Object.entries(weeks).map(([week, days]) => {
              const isPastWeek = isPastMonth || (week !== currentWeekStr);
              let weekItems = []; // Collect items for the week total
              
              const weekContent = Object.entries(days).map(([day, items]) => {
                 weekItems = weekItems.concat(items);
                 monthItems = monthItems.concat(items);

                 // ALWAYS render Day Accordion exactly like the reference image
                 const dayContent = (
                    <div className="list-container" style={{marginBottom: 0}}>
                       {items.map(item => (
                         <div key={item.id} className="list-item glass-card" style={{padding: '16px', cursor: 'pointer', margin: '0 0 8px 0', border: '1px solid var(--border-color)', background: 'var(--glass-bg)'}} onClick={() => setSelectedItem({type, data: item})}>
                             <div className="item-icon" style={{background: 'rgba(var(--surface-rgb),0.5)'}}>
                                {type === 'calorie' ? '🥗' : (item.type === 'cardio' ? '⚡' : '🏋️')}
                             </div>
                             <div className="item-content">
                                <div className="item-title" style={{textTransform: 'uppercase', fontWeight: '800'}}>
                                   {type === 'calorie' ? item.food_name : (item.type === 'cardio' ? 'Cardio Metrics' : item.movement_name)}
                                </div>
                                <div className="item-desc" style={{textTransform: 'uppercase', fontSize: '0.65rem'}}>
                                   {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}
                                </div>
                             </div>
                             <div className="item-action" style={{fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-color)'}}>
                                {type === 'calorie' 
                                    ? <>{item.calories} <span style={{fontSize: '0.7rem', color: 'var(--text-secondary)'}}>KCAL</span></> 
                                    : (item.type === 'cardio' ? <>{item.calories_burned} <span style={{fontSize: '0.7rem', color: 'var(--text-secondary)'}}>KCAL</span></> : <>{item.weight_kg} <span style={{fontSize: '0.7rem', color: 'var(--text-secondary)'}}>KG</span></>)}
                             </div>
                         </div>
                       ))}
                    </div>
                 );
                 return <AccordionNode key={day} title={day} openClass={!isPastWeek} subtitle={getTotals(items, type)}>{dayContent}</AccordionNode>;
              });

              return <AccordionNode key={week} title={week} openClass={!isPastWeek} subtitle={getTotals(weekItems, type)}>{weekContent}</AccordionNode>;
          });

          return <AccordionNode key={month} title={month} openClass={!isPastMonth} subtitle={getTotals(monthItems, type)}>{monthContent}</AccordionNode>;
      });
  };

  // --- DASHBOARD CALCULATIONS ---
  // Activity Heatmap (Current Month)
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth();
  const daysInMonth = new Date(currentYear, currentMonthNum + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonthNum, 1).getDay();
  
  let monthGrid = [];
  let startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Make Monday=0
  for(let i=0; i < startOffset; i++) monthGrid.push({ day: '', empty: true });
  
  for(let i=1; i<=daysInMonth; i++) {
     const dateStr = new Date(currentYear, currentMonthNum, i).toDateString();
     const isActive = workouts.some(w => new Date(w.created_at).toDateString() === dateStr);
     monthGrid.push({ day: i, active: isActive, date: dateStr, isToday: i === now.getDate() });
  }

  // Streak Counter
  let streak = 0;
  for(let i=0; i<365; i++) {
      const checkD = new Date(currentYear, currentMonthNum, now.getDate() - i).toDateString();
      if(workouts.some(w => new Date(w.created_at).toDateString() === checkD)) {
          streak++;
      } else {
          if (i === 0) continue; // Missing today doesn't break streak yet
          break;
      }
  }

  // Training & Weight Trends
  const weightLogs = workouts.filter(w => w.weight_kg).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  const latestWeight = weightLogs.length > 0 ? `${weightLogs[0].weight_kg} kg` : '-';
  
  const getAverageSessions = (days) => {
      const msInDays = days * 24 * 60 * 60 * 1000;
      const recent = workouts.filter(w => (now - new Date(w.created_at)) < msInDays);
      return recent.length;
  };

  const todaySessions = todaysWorkouts.length;
  const weeklySessions = getAverageSessions(7);
  const monthlySessions = getAverageSessions(30);
  const maxSessionGraph = Math.max(todaySessions, weeklySessions, monthlySessions, 5);

  return (
    <>
      <div style={{padding: '0 24px', minHeight: 'calc(100vh - 150px)'}}>
        
        {/* DASHBOARD TAB */}
        {tab === 'dashboard' && (
          <div style={{paddingBottom: '40px'}}>
            
            {/* Calorie Trend & BB Card */}
            <div className="glass-card" style={{marginBottom: '24px', position: 'relative', overflow: 'hidden', cursor: 'pointer'}} onClick={() => { if(!isEditingWeight) setGraphModalType('calorie'); }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                 <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Calorie Progress <span style={{fontSize: '0.6rem', color: 'var(--accent-color)'}}>(Click for Graph)</span></div>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px'}}>
                  <div style={{display: 'flex', alignItems: 'baseline', gap: '8px'}}>
                     <span style={{fontSize: '2.5rem', fontWeight: '800'}}>{totalCalories.toLocaleString()}</span>
                     <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>KCAL TODAY</span>
                  </div>
                  
                  <div style={{textAlign: 'right', cursor: 'default', position: 'relative', zIndex: 10}} onClick={(e) => e.stopPropagation()}>
                     <div style={{fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px'}}>Berat Badan (BB)</div>
                     {isEditingWeight ? (
                        <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                           <input type="number" onPointerDown={e => e.stopPropagation()} value={weightInput} onChange={e => setWeightInput(e.target.value)} autoFocus style={{width: '60px', padding: '4px', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px'}} />
                           <button onPointerDown={e => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); handleSaveWeight(e); }} style={{padding: '4px 8px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold'}}>✓</button>
                        </div>
                     ) : (
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end'}}>
                           <span style={{fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)'}}>{bodyWeight} kg</span>
                           <span onPointerDown={e => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setWeightInput(bodyWeight); setIsEditingWeight(true); }} style={{fontSize: '1rem', color: 'var(--accent-color)', cursor: 'pointer', padding: '8px', margin: '-8px'}}>✏️</span>
                        </div>
                     )}
                  </div>
              </div>
              
              <div className="linear-progress-wrapper" style={{width: '100%', marginBottom: '16px'}}>
                 <div className="linear-progress-track">
                     <div className="linear-progress-fill" style={{width: `${calPercent}%`}}></div>
                 </div>
              </div>
              
              <div style={{position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '6rem', opacity: 0.05, transform: 'rotate(15deg)'}}>🔥</div>
            </div>

            {/* Keaktifan / Manual Streak Check-in */}
            <div className="glass-card" style={{textAlign: 'center', padding: '32px 16px', border: streakData.checkedInToday ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)'}}>
               <h3 style={{fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>Daily Check-In</h3>
               <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '24px'}}>Tap the flame to claim your activity today!</p>
               
               <div className={`flame-btn ${streakData.checkedInToday ? 'lit' : ''}`} onClick={handleCheckIn}>
                   {streakData.checkedInToday ? '🔥' : '🔥'}
               </div>
               
               <div style={{fontSize: '1.5rem', fontWeight: '800', color: streakData.checkedInToday ? '#ef4444' : 'var(--text-primary)'}}>
                   {streakData.streak} <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>DAY STREAK</span>
               </div>
               {streakData.checkedInToday && <div style={{fontSize: '0.7rem', color: '#ef4444', marginTop: '8px', fontWeight: '600', animation: 'scaleIn 0.3s forwards'}}>Checked in for today!</div>}
            </div>

          </div>
        )}

        {/* NUTRITION TAB */}
        {tab === 'nutrition' && (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
               <h3 style={{fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Nutrition Log</h3>
               <input type="date" value={calSearchDate} onChange={e => setCalSearchDate(e.target.value)} style={{padding: '8px', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)'}} />
            </div>

            <div style={{marginBottom: '32px'}}>
              {renderGroupedList(calories, 'calorie', calSearchDate)}
            </div>
          </div>
        )}

        {/* TRAINING TAB */}
        {tab === 'training' && (
           <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
               <h3 style={{fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Training Performance</h3>
               <input type="date" value={workSearchDate} onChange={e => setWorkSearchDate(e.target.value)} style={{padding: '8px', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)'}} />
            </div>

            <div>
               {renderGroupedList(workouts, 'workout', workSearchDate)}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <div style={{paddingBottom: '40px'}}>
             <div className="glass-card" style={{textAlign: 'center', padding: '32px 16px', position: 'relative'}}>
                <h2 style={{margin: 0, fontSize: '1.8rem', textTransform: 'capitalize'}}>{userData?.full_name || 'Fitness User'}</h2>
                <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '32px'}}>{userData?.email}</p>
                
                <div style={{display: 'flex', gap: '8px', justifyContent: 'space-evenly', borderTop: '1px solid var(--border-color)', paddingTop: '24px'}}>
                   <div style={{flex: 1}}>
                      <div style={{fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)'}}>{streakData.streak}</div>
                      <div style={{fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px'}}>Day Streak</div>
                   </div>
                   <div style={{width: '2px', background: 'var(--border-color)'}}></div>
                   <div style={{flex: 1}}>
                      <div style={{fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)'}}>{bodyWeight} <span style={{fontSize: '0.8rem'}}>kg</span></div>
                      <div style={{fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px'}}>Weight</div>
                   </div>
                   <div style={{width: '2px', background: 'var(--border-color)'}}></div>
                   <div style={{flex: 1}}>
                      <div style={{fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)'}}>{workouts.length}</div>
                      <div style={{fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px'}}>Log Sessions</div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bottom-nav">
        <div className={`nav-item ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>
          <div className="icon">⏱️</div>
          <span>DASHBOARD</span>
        </div>
        
        <div className={`nav-item ${tab === 'nutrition' ? 'active' : ''}`} onClick={() => setTab('nutrition')}>
          <div className="icon">🥗</div>
          <span>NUTRITION</span>
        </div>

        <div className="fab-container">
           <button className="fab" onClick={() => { setModalType('workout'); setIsModalOpen(true); }}>
             +
           </button>
        </div>
        
        <div className={`nav-item ${tab === 'training' ? 'active' : ''}`} onClick={() => setTab('training')}>
          <div className="icon">🏋️</div>
          <span>TRAINING</span>
        </div>
        
        <div className={`nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
          <div className="icon">👤</div>
          <span>PROFILE</span>
        </div>
      </div>

      {/* Input Bottom Sheet Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsModalOpen(false); setIsEditingItem(false); setSelectedItem(null); }}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            
            {!isEditingItem && (

              <div className="modal-tabs">
                  <button className={`modal-tab ${modalType === 'calorie' ? 'active' : ''}`} onClick={() => setModalType('calorie')}>NUTRITION</button>
                  <button className={`modal-tab ${modalType === 'workout' ? 'active' : ''}`} onClick={() => setModalType('workout')}>TRAINING</button>
              </div>
            )}

            {modalType === 'workout' ? (
                <WorkoutForm 
                  token={token} 
                  initialData={isEditingItem ? selectedItem?.data : null}
                  onSuccess={() => { setIsModalOpen(false); setIsEditingItem(false); setSelectedItem(null); fetchData(); }} 
                  onClose={() => { setIsModalOpen(false); setIsEditingItem(false); setSelectedItem(null); }}
                />
            ) : (
                <CalorieForm 
                  token={token} 
                  initialData={isEditingItem ? selectedItem?.data : null}
                  onSuccess={() => { setIsModalOpen(false); setIsEditingItem(false); setSelectedItem(null); fetchData(); }} 
                  onClose={() => { setIsModalOpen(false); setIsEditingItem(false); setSelectedItem(null); }}
                />
            )}

          </div>
        </div>
      )}

      {/* Graphs Bottom Sheet Modal */}
      {graphModalType && (
        <div className="modal-overlay" onClick={() => setGraphModalType(null)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle"></div>
            
            <h3 style={{fontSize: '1rem', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-primary)'}}>
               {graphModalType === 'calorie' ? 'Calorie Trends Recap' : 'Training & Weight Recap'}
            </h3>
            <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Average statistics over time.</p>

            <div className="chart-container" style={{background: 'var(--glass-bg)', padding: '24px 16px', borderRadius: '12px', marginTop: '16px', border: '1px solid var(--border-color)'}}>
               {graphModalType === 'calorie' ? (
                   <>
                     <div className="chart-bar-wrapper">
                        <div className="chart-value">{dailyAvg}</div>
                        <div className="chart-bar" style={{height: `${(dailyAvg / maxGraphVal) * 100}%`}}></div>
                        <div className="chart-label">Today</div>
                     </div>
                     <div className="chart-bar-wrapper">
                        <div className="chart-value">{weeklyAvg}</div>
                        <div className="chart-bar" style={{height: `${(weeklyAvg / maxGraphVal) * 100}%`, background: 'var(--text-secondary)'}}></div>
                        <div className="chart-label">7 Day</div>
                     </div>
                     <div className="chart-bar-wrapper">
                        <div className="chart-value">{monthlyAvg}</div>
                        <div className="chart-bar" style={{height: `${(monthlyAvg / maxGraphVal) * 100}%`, background: 'var(--text-light)'}}></div>
                        <div className="chart-label">30 Day</div>
                     </div>
                   </>
               ) : (
                   <>
                     <div className="chart-bar-wrapper">
                        <div className="chart-value">{todaySessions}</div>
                        <div className="chart-bar" style={{height: `${(todaySessions / maxSessionGraph) * 100}%`, background: 'var(--accent-color)'}}></div>
                        <div className="chart-label">Today</div>
                     </div>
                     <div className="chart-bar-wrapper">
                        <div className="chart-value">{weeklySessions}</div>
                        <div className="chart-bar" style={{height: `${(weeklySessions / maxSessionGraph) * 100}%`, background: 'var(--text-secondary)'}}></div>
                        <div className="chart-label">7 Day</div>
                     </div>
                     <div className="chart-bar-wrapper">
                        <div className="chart-value">{monthlySessions}</div>
                        <div className="chart-bar" style={{height: `${(monthlySessions / maxSessionGraph) * 100}%`, background: 'var(--text-light)'}}></div>
                        <div className="chart-label">30 Day</div>
                     </div>
                   </>
               )}
            </div>
            
            {graphModalType === 'training' && (
               <div style={{marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(var(--surface-rgb), 0.3)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                   <div style={{fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)'}}>Current Weight</div>
                   <div style={{fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-color)'}}>{latestWeight}</div>
               </div>
            )}

            <button className="primary" onClick={() => setGraphModalType(null)} style={{width: '100%', marginTop: '24px'}}>Close Graphs</button>
          </div>
        </div>
      )}
      {selectedItem && !isEditingItem && (
         <div className="modal-overlay" onClick={() => setSelectedItem(null)} style={{alignItems: 'center'}}>
            <div className="detail-modal" onClick={e => e.stopPropagation()}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)'}}>
                    <h3 style={{fontSize: '1.1rem', textTransform: 'uppercase', margin: 0}}>
                       {selectedItem.type === 'calorie' ? 'Log Details' : 'Training Details'}
                    </h3>
                    <div style={{display: 'flex', gap: '8px'}}>
                        <button onClick={() => { setIsEditingItem(true); setModalType(selectedItem.type); setIsModalOpen(true); }} style={{background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 10px', fontSize: '0.9rem', cursor: 'pointer'}}>✏️</button>
                        <button onClick={handleDelete} style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '6px 10px', fontSize: '0.9rem', cursor: 'pointer', color: '#ef4444'}}>🗑️</button>
                    </div>
                </div>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    {selectedItem.type === 'calorie' ? (
                        <>
                           <div>
                              <div className="detail-label">Food Name</div>
                              <div className="detail-value">{selectedItem.data.food_name}</div>
                           </div>
                           <div>
                              <div className="detail-label">Calories Input</div>
                              <div className="detail-value">{selectedItem.data.calories} kcal</div>
                           </div>
                           <div>
                              <div className="detail-label">Meal Time</div>
                              <div className="detail-value">{selectedItem.data.meal_time}</div>
                           </div>
                        </>
                    ) : (
                        selectedItem.data.type === 'cardio' ? (
                            <>
                               <div>
                                  <div className="detail-label">Type</div>
                                  <div className="detail-value">Cardio</div>
                               </div>
                               <div>
                                  <div className="detail-label">Distance / Time</div>
                                  <div className="detail-value">{selectedItem.data.distance} km / {selectedItem.data.duration} min</div>
                               </div>
                               <div>
                                  <div className="detail-label">Steps Taken</div>
                                  <div className="detail-value">{selectedItem.data.steps}</div>
                               </div>
                               <div>
                                  <div className="detail-label">Calories Burned</div>
                                  <div className="detail-value">{selectedItem.data.calories_burned} kcal</div>
                               </div>
                            </>
                        ) : (
                            <>
                               <div>
                                  <div className="detail-label">Movement</div>
                                  <div className="detail-value">{selectedItem.data.movement_name}</div>
                               </div>
                               <div>
                                  <div className="detail-label">Reps per set</div>
                                  <div className="detail-value">{selectedItem.data.reps}</div>
                               </div>
                               <div>
                                  <div className="detail-label">Total Sets</div>
                                  <div className="detail-value">{selectedItem.data.sets}</div>
                               </div>
                               <div>
                                  <div className="detail-label">Weight Class</div>
                                  <div className="detail-value">{selectedItem.data.weight_kg} kg</div>
                               </div>
                            </>
                        )
                    )}
                    <div>
                       <div className="detail-label">Timestamp (Server)</div>
                       <div className="detail-value" style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{new Date(selectedItem.data.created_at).toLocaleString()}</div>
                    </div>
                </div>

                <button className="primary" onClick={() => setSelectedItem(null)} style={{width: '100%', marginTop: '24px'}}>Close Detail</button>
            </div>
         </div>
      )}
    </>
  );
}
