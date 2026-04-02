import React, { useState } from 'react';
import API_BASE from '../../config';
import './styles.css';

const WorkoutForm = ({ token, onSuccess, onClose, initialData = null }) => {
  const [type, setType] = useState(initialData?.type || 'cardio');
  const [targetDate, setTargetDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '');
  const [movement, setMovement] = useState(initialData?.movement || '');
  const [sets, setSets] = useState(initialData?.sets || '');
  const [reps, setReps] = useState(initialData?.reps || '');
  const [weight, setWeight] = useState(initialData?.weight || '');
  const [steps, setSteps] = useState(initialData?.steps || '');
  const [caloriesBurned, setCaloriesBurned] = useState(initialData?.calories_burned || '');
  const [duration, setDuration] = useState(initialData?.duration || '');
  const [distance, setDistance] = useState(initialData?.distance || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = initialData 
      ? `${API_BASE}/api/tracking/workout/${initialData.id}`
      : `${API_BASE}/api/tracking/workout`;
    
    const method = initialData ? 'PUT' : 'POST';

    const body = type === 'cardio' 
      ? { type, date: targetDate || undefined, steps: Number(steps), calories_burned: Number(caloriesBurned), duration: Number(duration), distance: Number(distance) }
      : { type, date: targetDate || undefined, movement, sets: Number(sets), reps: Number(reps), weight: Number(weight) };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
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
          <h2>{initialData ? 'Edit Latihan' : 'Tambah Latihan'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="form-content">
          <div className="form-group">
            <label>TIPE LATIHAN</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="cardio">Cardio / Steps</option>
              <option value="hypertrophy">Gym (Sets/Reps)</option>
            </select>
          </div>

          <div className="form-group">
            <label>TANGGAL (OPSIONAL)</label>
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          </div>

          {type === 'cardio' ? (
            <>
              <div className="form-group">
                <label>LANGKAH (STEPS)</label>
                <input type="number" value={steps} onChange={e => setSteps(e.target.value)} placeholder="0" />
              </div>
              <div className="form-group">
                <label>KALORI (KCAL)</label>
                <input type="number" value={caloriesBurned} onChange={e => setCaloriesBurned(e.target.value)} placeholder="0" />
              </div>
              <div className="form-group">
                <label>DURASI (MENIT)</label>
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="0" />
              </div>
              <div className="form-group">
                <label>JARAK (KM)</label>
                <input type="number" step="0.1" value={distance} onChange={e => setDistance(e.target.value)} placeholder="0.0" />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>NAMA GERAKAN</label>
                <input type="text" value={movement} onChange={e => setMovement(e.target.value)} placeholder="mis. Bench Press" required />
              </div>
              <div className="form-group">
                <label>SET</label>
                <input type="number" value={sets} onChange={e => setSets(e.target.value)} placeholder="0" required />
              </div>
              <div className="form-group">
                <label>REPS</label>
                <input type="number" value={reps} onChange={e => setReps(e.target.value)} placeholder="0" required />
              </div>
              <div className="form-group">
                <label>BEBAN (KG)</label>
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0" />
              </div>
            </>
          )}
        </div>

        <div className="form-footer">
          <button className="submit-btn" onClick={handleSubmit}>
            {initialData ? 'Simpan Perubahan' : 'Tambah Latihan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutForm;
