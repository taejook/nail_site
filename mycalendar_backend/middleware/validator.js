// middleware/validators.js
const { celebrate, Joi, Segments, errors: celebrateErrors } = require("celebrate");
const validator = require("validator");

// Optional: Mongo ObjectId validator
const validateObjectId = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
  }),
});

// Auth: Register
const validateRegister = celebrate({
  [Segments.BODY]: Joi.object()
    .keys({
      fullName: Joi.string().trim().min(2).max(50).required().messages({
        "string.min": 'The minimum length of "fullName" is 2',
        "string.max": 'The maximum length of "fullName" is 50',
        "string.empty": '"fullName" is required',
      }),
      email: Joi.string().trim().lowercase().email().required().messages({
        "string.email": '"email" must be a valid email',
        "string.empty": '"email" is required',
      }),
      password: Joi.string().min(6).required().messages({
        "string.min": '"password" must be at least 6 characters',
        "string.empty": '"password" is required',
      }),
    })
    .required(),
});

// Auth: Login
const validateLogin = celebrate({
  [Segments.BODY]: Joi.object()
    .keys({
      email: Joi.string().trim().lowercase().email().required().messages({
        "string.email": '"email" must be a valid email',
        "string.empty": '"email" is required',
      }),
      password: Joi.string().required().messages({
        "string.empty": '"password" is required',
      }),
    })
    .required(),
});

module.exports = {
  validateObjectId,
  validateRegister,
  validateLogin,
  celebrateErrors, 
};
