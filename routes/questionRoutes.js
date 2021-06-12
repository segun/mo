const express = require('express');
const verifyToken = require('../middleware/auth');
const questionController = require('../controllers/question.controller');

const router = express.Router();

router.get('/', verifyToken, questionController.index);
router.post('/new', verifyToken, questionController.newQuestion);
router.get('/:questionId', verifyToken, questionController.viewQuestion);
router.put('/:questionId', verifyToken, questionController.editQuestion);

module.exports = router;