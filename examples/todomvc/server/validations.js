const Joi = require('joi');

const todoBody = {
  text: Joi.string().min(2).required(),
};

module.exports = {
  todo: {
    body: todoBody
  },
};
