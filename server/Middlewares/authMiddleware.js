const supabase = require('../config/supabaseClient');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // We use the service client to get user by token since standard JWT verify requires secret
    // Or we just verify using Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token', data: null });
    }

    req.user = user;
    next();
};

const verifyAdmin = async (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Check profiles for admin status
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin, is_approved')
        .eq('id', req.user.id)
        .single();

    if (error || !profile?.is_admin || !profile?.is_approved) {
        return res.status(403).json({ success: false, message: 'Forbidden: Admin access required', data: null });
    }

    next();
};

const verifyApproved = async (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_approved')
        .eq('id', req.user.id)
        .single();

    if (error || !profile?.is_approved) {
        return res.status(403).json({ success: false, message: 'Account is pending admin approval', data: null });
    }

    next();
};

module.exports = { verifyToken, verifyAdmin, verifyApproved };
