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
      ? `${API_BASE}/api/tracking/calories/${initialData.id}`
      : `${API_BASE}/api/tracking/calories`;
    
    const method = initialData ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          food_name: foodName, 
          calories: Number(calories), 
          created_at: targetDate || undefined 
        })
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert('Gagal menyimpan nutrisi: ' + (data.message || 'Error tidak diketahui'));
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan: ' + err.message);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{initialData ? 'Ubah Nutrisi' : 'Tambah Nutrisi'}</h2>
      </div>

      <div className="form-field">
        <label>NAMA MAKANAN / MINUMAN</label>
        <input type="text" value={foodName} onChange={e => setFoodName(e.target.value)} placeholder="mis. Nasi Goreng" required />
      </div>

      <div className="form-field">
        <label>KALORI (KCAL)</label>
        <input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="0" required />
      </div>

      <div className="form-field">
        <label>TANGGAL (OPSIONAL)</label>
        <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
      </div>

      <button className="form-submit" onClick={handleSubmit}>Simpan Nutrisi</button>
    </div>
  );
};


export default CalorieForm;
