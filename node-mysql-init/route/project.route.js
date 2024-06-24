const express = require('express');
const project = require('../controller/project.controller');

const router = express.Router();

router.route('/').get(project.handleApiAll);

module.exports = router;
