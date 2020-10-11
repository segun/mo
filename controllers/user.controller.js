const userModel = require('../models/user.model');

const index = async (req, res) => {
    userModel.getAllUsers(req, res);
}

const newUser = async (req, res) => {
    userModel.addNewUser(req, res).then(() => {});
}

const login = async (req, res) => {
    userModel.login(req, res).then(() => {});
}

const findUser = async(req, res) => {
    userModel.getById(req, res).then(() => {});
}

const editUser = async(req, res) => {
    userModel.editUser(req, res).then(() => {});
}

const deleteUser = async(req, res) => {
    userModel.deleteUser(req, res).then(() => {});
}

module.exports = {
    index,
    newUser,
    login,
    findUser,
    editUser,
    deleteUser,
};