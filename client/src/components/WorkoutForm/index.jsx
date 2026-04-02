import { useState } from 'react';
import './styles.css';
import API_BASE from '../../config';

export default function WorkoutForm({ token, onSuccess, initialData }) {
  const [type, setType] = useState(initialData?.type || 'cardio'); // cardio | hypertrophy

  // Cardio fields
  const [steps, setSteps] = useState(initialData?.steps || '');
  const [caloriesBurned, setCaloriesBurned] = useState(initialData?.calories_burned || '');
  const [duration, setDuration] = useState(initialData?.duration || '');
  const [distance, setDistance] = useState(initialData?.distance || '');

  // Hypertrophy fields
  const [movement, setMovement] = useState(initialData?.movement_name || '');
  const [sets, setSets] = useState(initialData?.sets || '');
  const [reps, setReps] = useState(initialData?.reps || '');
  const [weight, setWeight] = useState(initialData?.weight_kg || '');

  const [loading, setLoading] = useState(false);
  const [targetDate, setTargetDate] = useState(initialData?.created_at ? new Date(initialData.created_at).toISOString().split('T')[0] : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = { type };
    if (targetDate) payload.created_at = new Date(targetDate).toISOString();
    if (type === 'cardio') {
      Object.assign(payload, {
        steps: parseInt(steps) || 0,
        calories_burned: parseFloat(caloriesBurned) || 0,
        duration: parseInt(duration) || 0,
        distance: parseFloat(distance) || 0
      });
    } else {
      Object.assign(payload, {
        movement_name: movement,
        sets: parseInt(sets) || 0,
        reps: parseInt(reps) || 0,
        weight_kg: parseFloat(weight) || 0
      });
    }

    try {
      const url = initialData
        ? `${API_BASE}/api/tracking/workouts/${initialData.id}`
        : `${API_BASE}/api/tracking/workouts`;

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
        // Reset forms
        setSteps(''); setCaloriesBurned(''); setDuration(''); setDistance('');
        setMovement(''); setSets(''); setReps(''); setWeight('');
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
        {initialData ? 'Edit Latihan' : 'Tambah Latihan'}
      </h3>
      <div className="input-group" style={{ marginTop: '12px' }}>
        <label>Tipe Latihan</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="cardio">Cardio</option>
          <option value="hypertrophy">Gym (Hypertrophy)</option>
        </select>
      </div>

      <div className="input-group">
        <label>Tanggal Latihan (Opsional)</label>
        <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} onClick={e => e.target.showPicker && e.target.showPicker()} />
      </div>

      <form onSubmit={handleSubmit}>
        {type === 'cardio' ? (
          <>
            <div className="input-group">
              <label>Langkah (Steps)</label>
              <input type="number" value={steps} onChange={e => setSteps(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Kalori Terbakar (kcal)</label>
              <input type="number" value={caloriesBurned} onChange={e => setCaloriesBurned(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Durasi</label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Jarak (Km)</label>
              <input type="number" step="0.1" value={distance} onChange={e => setDistance(e.target.value)} />
            </div>
          </>
        ) : (
          <>
            <div className="input-group">
              <label>Nama Gerakan</label>
              <input type="text" value={movement} onChange={e => setMovement(e.target.value)} required placeholder="mis. Squad, Bench Press" />
            </div>
            <div className="input-group">
              <label>Set</label>
              <input type="number" value={sets} onChange={e => setSets(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Reps</label>
              <input type="number" value={reps} onChange={e => setReps(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Beban (Kg)</label>
              <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} required />
            </div>
          </>
        )}
        <button type="submit" className="primary" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
          Simpan Latihan
        </button>
      </form>
    </div>
  );
}
