const express = require('express');
const answerController = require('../controllers/answer.controller');

const router = express.Router();

router.get('/checkAvailability/:email', answerController.checkAvailability);
router.post('/submit', answerController.submitAnswers);

module.exports = router;