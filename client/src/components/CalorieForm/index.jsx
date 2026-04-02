import { useState } from 'react';
import './styles.css';
import API_BASE from '../../config';

export default function CalorieForm({ token, onSuccess, initialData }) {
  const [foodName, setFoodName] = useState(initialData?.food_name || '');
  const [calories, setCalories] = useState(initialData?.calories || '');
  const [mealTime, setMealTime] = useState(initialData?.meal_time || '');
  const [targetDate, setTargetDate] = useState(initialData?.created_at ? new Date(initialData.created_at).toISOString().split('T')[0] : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        food_name: foodName,
        calories: parseFloat(calories),
        meal_time: mealTime || new Date().toLocaleTimeString('en-US', { hour12: false })
      };
      if (targetDate) payload.created_at = new Date(targetDate).toISOString();

      const url = initialData
        ? `${API_BASE}/api/tracking/calories/${initialData.id}`
        : `${API_BASE}/api/tracking/calories`;

      const res = await fetch(url, {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setFoodName('');
        setCalories('');
        setMealTime('');
        if (onSuccess) onSuccess();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: '1rem', marginBottom: '0', color: 'var(--text-primary)' }}>
        {initialData ? 'Edit Kalori' : 'Tambah Kalori'}
      </h3>
      <form onSubmit={handleSubmit} style={{ marginTop: '12px' }}>
        <div className="input-group">
          <label>Nama Makanan</label>
          <input type="text" value={foodName} onChange={e => setFoodName(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Kalori (kcal)</label>
          <input type="number" value={calories} onChange={e => setCalories(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Tanggal & Waktu Input (Opsional)</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} onClick={e => e.target.showPicker && e.target.showPicker()} style={{ flex: 1 }} />
            <input type="time" value={mealTime} onChange={e => setMealTime(e.target.value)} onClick={e => e.target.showPicker && e.target.showPicker()} required style={{ flex: 1 }} />
          </div>
        </div>
        <button type="submit" className="primary" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
          Simpan Kalori
        </button>
      </form>
    </div>
  );
}
