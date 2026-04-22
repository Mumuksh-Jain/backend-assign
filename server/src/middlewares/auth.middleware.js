const jwt = require('jsonwebtoken');
const ApiError = require('../utils/api-error');

const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || '';
        const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        const token = bearerToken || req.cookies?.token;

        if (!token) {
            throw new ApiError(401, 'Unauthorized');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            ...decoded,
            id: decoded.id || decoded._id
        };
        next();
    } catch (error) {
        return next(new ApiError(401, 'Invalid or expired token'));
    }
};

const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin only' });
    }
    next();
};

module.exports = {
    protect,
    adminOnly
};
