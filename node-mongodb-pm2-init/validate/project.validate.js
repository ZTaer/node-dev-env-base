const Joi = require('joi');
const { objectId } = require('./custom.validation');

exports.projectAll = {
  query: Joi.object().keys({
    title: Joi.string().required(),
  }),
};
