import React, { useState } from 'react';
import API_BASE from '../../config';
import '../WorkoutForm/styles.css'; // Gunakan CSS yang sama agar konsisten

const CalorieForm = ({ token, onSuccess, onClose, initialData = null }) => {
  const [foodName, setFoodName] = useState(initialData?.food_name || '');
  const [calories, setCalories] = useState(initialData?.calories || '');
  const [targetDate, setTargetDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = initialData 
      ? `${API_BASE}/api/tracking/nutrition/${initialData.id}`
      : `${API_BASE}/api/tracking/nutrition`;
    
    const method = initialData ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ food_name: foodName, calories: Number(calories), date: targetDate || undefined })
      });
      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="overlay-form" onClick={(e) => e.target.className === 'overlay-form' && onClose()}>
      <div className="form-container">
        <div className="form-header">
          <h2>{initialData ? 'Edit Nutrisi' : 'Tambah Nutrisi'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="form-content">
          <div className="form-group">
            <label>NAMA MAKANAN / MINUMAN</label>
            <input type="text" value={foodName} onChange={e => setFoodName(e.target.value)} placeholder="mis. Nasi Goreng" required />
          </div>

          <div className="form-group">
            <label>KALORI (KCAL)</label>
            <input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="0" required />
          </div>

          <div className="form-group">
            <label>TANGGAL (OPSIONAL)</label>
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          </div>
        </div>

        <div className="form-footer">
          <button className="submit-btn" onClick={handleSubmit}>
            {initialData ? 'Simpan Perubahan' : 'Tambah Nutrisi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalorieForm;
