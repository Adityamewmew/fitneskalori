const express = require('express');
const { 
  addCalorie, getCalories, updateCalorie, deleteCalorie,
  addWorkout, getWorkouts, updateWorkout, deleteWorkout 
} = require('../Controllers/trackingController');
const { verifyToken, verifyApproved } = require('../Middlewares/authMiddleware');
const router = express.Router();

router.use(verifyToken, verifyApproved);

router.post('/calories', addCalorie);
router.get('/calories', getCalories);
router.put('/calories/:id', updateCalorie);
router.delete('/calories/:id', deleteCalorie);

router.post('/workouts', addWorkout);
router.get('/workouts', getWorkouts);
router.put('/workouts/:id', updateWorkout);
router.delete('/workouts/:id', deleteWorkout);

module.exports = router;
