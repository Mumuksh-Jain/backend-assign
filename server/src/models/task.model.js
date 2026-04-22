const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true }
    ,
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],  
    }
}, { timestamps: true });

const taskModel = mongoose.model('Task', taskSchema);
module.exports = taskModel;