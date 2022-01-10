const express = require('express');
const answerController = require('../controllers/answer.controller');

const router = express.Router();

const  multipart  =  require('connect-multiparty');
const  multipartMiddleware  =  multipart({ uploadDir:  './uploads' });

router.get('/checkAvailability/:email', answerController.checkAvailability);
router.post('/submit', answerController.submitAnswers);
router.post('/contactForm', answerController.submitContactForm);
router.post('/uploadFile', multipartMiddleware, answerController.uploadFile);

module.exports = router;