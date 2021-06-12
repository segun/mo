const express = require('express');
const questionController = require('../controllers/question.controller');

const router = express.Router();

router.get('/', questionController.index);
router.post('/new', questionController.newQuestion);

module.exports = router;