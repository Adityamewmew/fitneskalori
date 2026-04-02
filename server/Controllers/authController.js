const supabase = require('../config/supabaseClient');

const register = async (req, res) => {
    const { email, password, full_name } = req.body;
    
    // Supabase auth registration
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return res.status(400).json({ success: false, message: error.message, data: null });
    }

    // Insert into profiles happens via trigger or manually here if no trigger exists.
    // Assuming backend inserts it if user is returned
    if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
            { id: data.user.id, email: email, full_name: full_name, is_admin: false, is_approved: false }
        ]);
        
        // Ignore unique constraint error if trigger already handles it, but update full_name
        if (profileError && profileError.code === '23505') {
           await supabase.from('profiles').update({ full_name: full_name }).eq('id', data.user.id);
        }
    }

    res.json({ success: true, message: 'Registration successful, awaiting admin approval', data: data.user });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        return res.status(400).json({ success: false, message: error.message, data: null });
    }

    // Check approval status
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();

    if (!profile?.is_approved && !profile?.is_admin) {
        // Sign out immediately if not approved
        // However, Supabase tokens are JWTs. We just tell the frontend to clear it.
        return res.status(403).json({ success: false, message: 'Account is pending admin approval', data: null });
    }

    res.json({ success: true, message: 'Login successful', data: { ...data, profile } });
};

const getProfile = async (req, res) => {
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', req.user.id).single();
    if (error) return res.status(400).json({ success: false, message: error.message, data: null });
    res.json({ success: true, message: 'Profile fetched', data: profile });
};

const updateProfileSettings = async (req, res) => {
    const { weight_kg, streak_count, last_checkin } = req.body;
    const updates = {};
    if (weight_kg !== undefined) updates.weight_kg = weight_kg;
    if (streak_count !== undefined) updates.streak_count = streak_count;
    if (last_checkin !== undefined) updates.last_checkin = last_checkin;

    if (Object.keys(updates).length === 0) return res.json({ success: true, message: 'Nothing to update', data: null });

    const { data, error } = await supabase.from('profiles').update(updates).eq('id', req.user.id).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message, data: null });
    res.json({ success: true, message: 'Profile updated', data });
};

module.exports = { register, login, getProfile, updateProfileSettings };
