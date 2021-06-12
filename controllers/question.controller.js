const questionModel = require('../models/questions.model');

const index = async (req, res) => {
    questionModel.getAllQuestions(req, res).then(() => {});
};

const newQuestion = async (req, res) => {
    questionModel.addNewQuestion(req, res).then(() => {});
};


module.exports = {
    index,
    newQuestion,
}