const supabase = require('../config/supabaseClient');

const getPendingUsers = async (req, res) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_approved', false)
        .eq('is_admin', false);

    if (error) return res.status(400).json({ success: false, message: error.message, data: null });
    res.json({ success: true, message: 'Pending users fetched', data });
};

const getActiveUsers = async (req, res) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_approved', true)
        .eq('is_admin', false);

    if (error) return res.status(400).json({ success: false, message: error.message, data: null });
    res.json({ success: true, message: 'Active users fetched', data });
};

const approveUser = async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', id);

    if (error) return res.status(400).json({ success: false, message: error.message, data: null });
    res.json({ success: true, message: 'User approved', data: null });
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    
    // Deleting from profiles will cascade if set up, or just delete from auth.users using service key
    const { error } = await supabase.auth.admin.deleteUser(id);
    
    // Fallback if no service key privileges: We just delete from profiles 
    // (though real unprivileged app shouldn't be able to delete auth.users)
    if (error) {
        const { error: profileError } = await supabase.from('profiles').delete().eq('id', id);
        if (profileError) return res.status(400).json({ success: false, message: profileError.message, data: null });
    }

    res.json({ success: true, message: 'User deleted', data: null });
};

module.exports = { getPendingUsers, getActiveUsers, approveUser, deleteUser };
