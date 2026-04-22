const taskModel = require('../models/task.model');
const ApiError = require('../utils/api-error');
const ApiResponse = require('../utils/api-response');

const createTask = async (req, res) => {
    try {
        const { title, description, status } = req.body;        
        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'Title and description are required' });
        }
        const validStatuses = ['pending', 'in-progress', 'completed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }
        const task = await taskModel.create({
            title,
            description,
            status,
            createdBy: req.user.id
        });
        return res.status(201).json(new ApiResponse(201, task, 'Task created successfully'));
    }
    catch (error) {
        throw new ApiError(500, 'Error creating task', [error.message]);
    }
};

const getAllTasks = async (req, res) => {
    try {
        const tasks = req.user.role === 'admin'
            ? await taskModel.find()
            : await taskModel.find({ createdBy: req.user.id });

        return res.status(200).json(new ApiResponse(200, tasks, 'Tasks retrieved successfully'));
    } catch (error) {
        throw new ApiError(500, 'Error retrieving tasks', [error.message]);
    }
};
const viewTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await taskModel.findById(id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        return res.status(200).json(new ApiResponse(200, task, 'Task retrieved successfully'));
    } catch (error) {
        throw new ApiError(500, 'Error retrieving task', [error.message]);
    }
};
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await taskModel.findByIdAndDelete(id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        return res.status(200).json(new ApiResponse(200, task, 'Task deleted successfully'));
    } catch (error) {
        throw new ApiError(500, 'Error deleting task', [error.message]);
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;

        const task = await taskModel.findById(id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized to update this task' });
        }

        const validStatuses = ['pending', 'in-progress', 'completed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;

        await task.save();
        return res.status(200).json(new ApiResponse(200, task, 'Task updated successfully'));
    } catch (error) {
        throw new ApiError(500, 'Error updating task', [error.message]);
    }
};
module.exports = {
    createTask,
    getAllTasks,
    viewTask,
    updateTask,
    deleteTask
};