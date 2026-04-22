const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

app.use(cookieParser());

const connectDB = require('./config/db');
const userRoutes = require('./routes/user.route');
const taskRoutes = require('./routes/task.route');

require('dotenv').config();
connectDB();

app.use(express.json());
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/tasks', taskRoutes);

module.exports = app;