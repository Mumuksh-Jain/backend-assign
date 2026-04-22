const express = require('express');
const taskController = require('../controllers/task.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');
const router = express.Router();

router.route('/').get(protect, taskController.getAllTasks).post(protect, taskController.createTask);
router.route('/:id').get(protect, taskController.viewTask).put(protect, taskController.updateTask).delete(protect, adminOnly, taskController.deleteTask);

module.exports = router;