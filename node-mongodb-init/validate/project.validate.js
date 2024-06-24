const Joi = require('joi');
const { objectId } = require('./custom.validation');

exports.wechatDataSetAdd = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    mainWechatAccount: Joi.string(),
  }),
};
