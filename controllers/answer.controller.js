const answerModel = require('../models/answer.model');
const status = require("http-status-codes");

const checkAvailability = async (req, res) => {
    answerModel.checkAvailability(req, res).then(() => {});
}

const submitAnswers = async (req, res) => {
    answerModel.submitAnswers(req, res).then(() => {});
}

const submitContactForm = async (req, res) => {
    answerModel.submitContactForm(req, res).then(() => {});
}

const uploadFile = async (req, res) => {
    var fs = require('fs');
    var dir = './uploads';
    
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }    
    const tempPath = req.files.uploads[0].path;
    const saved = await answerModel.uploadFile(req.body.email, tempPath);
    res.status(status.StatusCodes.CREATED).send({saved, tempPath});
}


module.exports = {
    checkAvailability,
    submitAnswers,
    submitContactForm,
    uploadFile
}