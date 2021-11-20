const joi = require("joi");

const schema = {
  registerSchema: joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(5).max(12).required(),
  }),
  loginSchema: joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(5).max(12).required(),
  }),
  forgotSchema: joi.object({
    email: joi.string().email().required(),
  }),
};

module.exports = schema;
