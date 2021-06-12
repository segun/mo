const express = require('express');
const verifyToken = require('../middleware/auth');
const questionController = require('../controllers/question.controller');

const router = express.Router();

router.get('/', questionController.index);
router.post('/new', questionController.newQuestion);
router.get('/:questionId', questionController.viewQuestion);
router.put('/:questionId', questionController.editQuestion);

module.exports = router;