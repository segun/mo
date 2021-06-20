const jwt = require('jsonwebtoken');
const statusCodes = require('http-status-codes');
const props = require('../config');

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        const errorMessage = 'Token not provided';
        return res.status(statusCodes.StatusCodes.BAD_REQUEST).send(errorMessage);
    }
    try {
        const decoded = jwt.verify(token, props.env.JWT_SECRET);
        req.user = {
            username: decoded.username,
            password: decoded.password
        };        
        next();
    } catch (error) {
        const errorMessage = 'Authentication Failed: ' + error;
        return res.status(statusCodes.StatusCodes.UNAUTHORIZED).send(errorMessage);
    }
};

module.exports = verifyToken;