const statusCodes = require('http-status-codes');
const offenderModel = require('../models/offender.model');

const index = async (req, res) => {
    offenderModel.getAllOffenders(req, res).then(() => {});
};

const newOffender = async (req, res) => {
    offenderModel.addNewOffender(req, res).then(() => {});
};

const viewOffender = async (req, res) => {
    offenderModel.getById(req, res).then(() => {});
};

const editOffender = async (req, res) => {
    offenderModel.editOffender(req, res).then(() => {});
}

const deleteOffender = async (req, res) => {
    offenderModel.deleteOffender(req, res).then(() => {});
}

const completeClass = async (req, res) => {
    offenderModel.completeClass(req, res).then(() => {});
}

module.exports = {
    index,
    newOffender,
    viewOffender,
    editOffender,
    deleteOffender,
    completeClass
}