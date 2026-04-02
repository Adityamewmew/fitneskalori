const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./Routes/authRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const trackingRoutes = require('./Routes/trackingRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tracking', trackingRoutes);

app.get('/', (req, res) => {
    res.json({ success: true, message: 'Fitness API MVP' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
