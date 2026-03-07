const { body } = require('express-validator');
const { SPECIALIZATIONS } = require('./constants');

// Auth validators
const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const lawyerRegisterValidator = [
  ...registerValidator,

  body('barCouncilNumber')
    .trim()
    .notEmpty()
    .withMessage('Bar Council enrollment number is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Invalid Bar Council number'),

  body('specializations')
    .isArray({ min: 1 })
    .withMessage('At least one specialization is required'),

  body('specializations.*')
    .isIn(SPECIALIZATIONS)
    .withMessage('Invalid specialization selected'),

  body('experience')
    .notEmpty()
    .withMessage('Years of experience is required')
    .isInt({ min: 0, max: 60 })
    .withMessage('Experience must be between 0 and 60 years'),

  body('consultationFee')
    .notEmpty()
    .withMessage('Consultation fee is required')
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number'),
];

const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('language')
    .optional()
    .isIn(['en', 'hi'])
    .withMessage('Language must be either en or hi'),
];

module.exports = {
  registerValidator,
  loginValidator,
  lawyerRegisterValidator,
  updateProfileValidator,
};