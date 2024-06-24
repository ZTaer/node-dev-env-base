const express = require('express');
const project = require('../controller/project.controller');
const validate = require('../middleware/validate.middleware');
const { projectValidate } = require('../validate/index');

const router = express.Router();

router
  .route('/')
  .get(
    validate.handleMidValidate(projectValidate.projectAll),
    project.handleApiWechatDataSetAll
  );

module.exports = router;
