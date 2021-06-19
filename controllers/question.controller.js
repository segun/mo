const questionModel = require('../models/questions.model');

const index = async (req, res) => {
    questionModel.getAllQuestions(req, res).then(() => {});
};

const newQuestion = async (req, res) => {
    questionModel.addNewQuestion(req, res).then(() => {});
};


const viewQuestion = async (req, res) => {
    questionModel.getById(req, res).then(() => {});
};

const editQuestion = async (req, res) => {
    questionModel.editQuestion(req, res).then(() => {});
}


module.exports = {
    index,
    newQuestion,
    viewQuestion,
    editQuestion
}