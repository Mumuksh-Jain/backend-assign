const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
const connectDB = require('./config/db');
const userRoutes = require('./routes/user.route');
const taskRoutes = require('./routes/task.route');

require('dotenv').config();
connectDB();

app.use(express.json());
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/tasks', taskRoutes);

module.exports = app;