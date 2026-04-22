const userModel = require('../models/user.model');
const ApiError = require('../utils/api-error');
const ApiResponse = require('../utils/api-response');

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            throw new ApiError(400, 'Name, email, and password are required');
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            throw new ApiError(400, 'User with this email already exists');
        }

        const newUser = await userModel.create({ name, email, password });
        const token = newUser.generateAccessToken();

        res.cookie('token', token, {
            httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(201).json(new ApiResponse(201, {
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        }, 'User registered successfully'));
    }
    catch (error) {
        if (error instanceof ApiError) {
            return res
                .status(error.statusCode)
                .json(new ApiResponse(error.statusCode, null, error.message));
        }
        return res.status(500).json(new ApiResponse(500, null, 'Server error'));
    }
}
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ApiError(400, 'Email and password required');
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            throw new ApiError(400, 'Invalid email or password');
        }   
        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            throw new ApiError(400, 'Invalid email or password');
        }
        const token = user.generateAccessToken();
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json(new ApiResponse(200, {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }, 'User logged in successfully'));
    }
    catch (error) {
        if (error instanceof ApiError) {
            return res
                .status(error.statusCode)
                .json(new ApiResponse(error.statusCode, null, error.message));
        }
        return res.status(500).json(new ApiResponse(500, null, 'Server error'));
    }
}
const logoutUser = (req, res) => {
    res.clearCookie('token');
    return res.status(200).json(new ApiResponse(200, null, 'User logged out successfully', true));
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser
}