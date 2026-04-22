const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true, 
        match: /^\S+@\S+\.\S+$/,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
}, { timestamps: true });
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return ;
    }
    this.password = await bcrypt.hash(this.password, 10);
    return ;
});
userSchema.methods.isPasswordCorrect = async function (password) {
    return bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            name: this.name,
            role: this.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );
};
const userModel = mongoose.model('User', userSchema);
module.exports = userModel;