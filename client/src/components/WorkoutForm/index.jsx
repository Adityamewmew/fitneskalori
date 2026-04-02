import React, { useState } from 'react';
import API_BASE from '../../config';
import './styles.css';

const WorkoutForm = ({ token, onSuccess, onClose, initialData = null }) => {
  const [type, setType] = useState(initialData?.type || 'cardio');
  const [targetDate, setTargetDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '');
  const [steps, setSteps] = useState(initialData?.steps || '');
  const [caloriesBurned, setCaloriesBurned] = useState(initialData?.calories_burned || '');
  const [movement, setMovement] = useState(initialData?.movement_name || '');
  const [sets, setSets] = useState(initialData?.sets || '');
  const [reps, setReps] = useState(initialData?.reps || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = initialData 
      ? `${API_BASE}/api/tracking/workouts/${initialData.id}`
      : `${API_BASE}/api/tracking/workouts`;
    const method = initialData ? 'PUT' : 'POST';

    const body = type === 'cardio' 
      ? { type, created_at: targetDate || undefined, steps: Number(steps), calories_burned: Number(caloriesBurned) }
      : { type, created_at: targetDate || undefined, movement_name: movement, sets: Number(sets), reps: Number(reps) };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{initialData ? 'Ubah Latihan' : 'Tambah Latihan'}</h2>
      </div>

      <div className="form-field">
        <label>TIPE LATIHAN</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="cardio">Cardio / Steps</option>
          <option value="hypertrophy">Gym (Sets/Reps)</option>
        </select>
      </div>

      <div className="form-field">
        <label>TANGGAL</label>
        <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
      </div>

      {type === 'cardio' ? (
        <>
          <div className="form-field">
            <label>LANGKAH (STEPS)</label>
            <input type="number" value={steps} onChange={e => setSteps(e.target.value)} placeholder="0" />
          </div>
          <div className="form-field">
            <label>KALORI (KCAL)</label>
            <input type="number" value={caloriesBurned} onChange={e => setCaloriesBurned(e.target.value)} placeholder="0" />
          </div>
        </>
      ) : (
        <>
          <div className="form-field">
            <label>NAMA GERAKAN</label>
            <input type="text" value={movement} onChange={e => setMovement(e.target.value)} placeholder="mis. Bench Press" />
          </div>
          <div className="form-field">
            <label>SET / REPS</label>
            <div className="form-row">
              <input type="number" value={sets} onChange={e => setSets(e.target.value)} placeholder="Sets" />
              <input type="number" value={reps} onChange={e => setReps(e.target.value)} placeholder="Reps" />
            </div>
          </div>
        </>
      )}

      <button className="form-submit" onClick={handleSubmit}>Simpan Latihan</button>
    </div>
  );
};


export default WorkoutForm;
