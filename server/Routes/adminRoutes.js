const express = require('express');
const { getPendingUsers, getActiveUsers, approveUser, deleteUser } = require('../Controllers/adminController');
const { verifyToken, verifyAdmin } = require('../Middlewares/authMiddleware');
const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.get('/pending', getPendingUsers);
router.get('/active', getActiveUsers);
router.put('/approve/:id', approveUser);
router.delete('/:id', deleteUser);

module.exports = router;
