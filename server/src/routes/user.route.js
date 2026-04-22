const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authControllers = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: firstError?.msg || 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

router.post('/register', [
  body('name').trim().escape().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars')
], validate, authControllers.registerUser);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
], validate, authControllers.loginUser);

router.post('/logout', protect, authControllers.logoutUser);

module.exports = router;