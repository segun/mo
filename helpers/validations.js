const jwt = require('jsonwebtoken');
const props = require('../config');
const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
   * isValidEmail helper method
   * @param {string} email
   * @returns {Boolean} True or False
   */
const isValidEmail = (email) => {
    const regEx = /\S+@\S+\.\S+/;
    return regEx.test(email);
};

/**
   * validatePassword helper method
   * @param {string} password
   * @returns {Boolean} True or False
   */
const validatePassword = (password) => {
    if (password.length <= 5 || password === '') {
        return false;
    } 
    return true;
};
/**
   * isEmpty helper method
   * @param {string, integer} input
   * @returns {Boolean} True or False
   */
const isEmpty = (input) => {
    if (input === undefined || input === '') {
        return true;
    }
    if (input.replace(/\s/g, '').length) {
        return false;
    }
    return true;
};

const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
}

const checkPassword = (password, encrypted) => {
    return bcrypt.compareSync(password, encrypted);
}

const generateToken = (username, password) => {
    token = jwt.sign({username: username, password: password}, props.env.JWT_SECRET, {expiresIn: '3d'});
    return token;
}

module.exports = {
    isValidEmail,
    validatePassword,
    isEmpty,
    generateToken,
    hashPassword,
    checkPassword
};