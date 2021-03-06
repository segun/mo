const answerModel = require('../models/answer.model');

const checkAvailability = async (req, res) => {
    answerModel.checkAvailability(req, res).then(() => {});
}

const submitAnswers = async (req, res) => {
    answerModel.submitAnswers(req, res).then(() => {});
}

const submitContactForm = async (req, res) => {
    answerModel.submitContactForm(req, res).then(() => {});
}


module.exports = {
    checkAvailability,
    submitAnswers,
    submitContactForm
}