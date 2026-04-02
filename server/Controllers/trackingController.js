const supabase = require('../config/supabaseClient');

const addCalorie = async (req, res) => {
    const { food_name, calories, meal_time, created_at } = req.body;
    
    const payload = { user_id: req.user.id, food_name, calories, meal_time };
    if (created_at) payload.created_at = created_at;

    const { data, error } = await supabase
        .from('calories')
        .insert([payload])
        .select();

    if (error) return res.status(400).json({ success: false, message: error.message, data: null });
    res.json({ success: true, message: 'Calorie entry added', data: data[0] });
};

const getCalories = async (req, res) => {
    const { data, error } = await supabase
        .from('calories')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ success: false, message: error.message, data: null });
    res.json({ success: true, message: 'Calorie entries fetched', data });
};

const addWorkout = async (req, res) => {
    const { type, movement_name, steps, calories_burned, duration, distance, sets, reps, weight_kg, created_at } = req.body;
    
    const payload = { user_id: req.user.id, type };
    if (created_at) payload.created_at = created_at;

    if (type === 'cardio') {
        Object.assign(payload, { steps, calories_burned, duration, distance });
    } else if (type === 'hypertrophy') {
        Object.assign(payload, { movement_name, sets, reps, weight_kg });
    }

    const { data, error } = await supabase.from('workouts').insert([payload]).select();

    if (error) return res.status(400).json({ success: false, message: error.message, data: null });
    res.json({ success: true, message: 'Workout entry added', data: data[0] });
};

const getWorkouts = async (req, res) => {
    const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ success: false, message: error.message, data: null });
    res.json({ success: true, message: 'Workout entries fetched', data });
};

const updateCalorie = async (req, res) => {
    const { id } = req.params;
    const { food_name, calories, meal_time, created_at } = req.body;
    const updates = { food_name, calories, meal_time };
    if (created_at) updates.created_at = created_at;

    const { data, error } = await supabase
        .from('calories')
        .update(updates)
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select();

    if (error) return res.status(400).json({ success: false, message: error.message, data: null });
    res.json({ success: true, message: 'Calorie entry updated', data: data[0] });
};

const deleteCalorie = async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
        .from('calories')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, message: 'Calorie entry deleted' });
};

const updateWorkout = async (req, res) => {
    const { id } = req.params;
    const { type, movement_name, steps, calories_burned, duration, distance, sets, reps, weight_kg, created_at } = req.body;
    
    const updates = { type };
    if (created_at) updates.created_at = created_at;
    if (type === 'cardio') {
        Object.assign(updates, { steps, calories_burned, duration, distance });
    } else if (type === 'hypertrophy') {
        Object.assign(updates, { movement_name, sets, reps, weight_kg });
    }

    const { data, error } = await supabase
        .from('workouts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select();

    if (error) return res.status(400).json({ success: false, message: error.message, data: null });
    res.json({ success: true, message: 'Workout entry updated', data: data[0] });
};

const deleteWorkout = async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, message: 'Workout entry deleted' });
};

module.exports = { addCalorie, getCalories, updateCalorie, deleteCalorie, addWorkout, getWorkouts, updateWorkout, deleteWorkout };
