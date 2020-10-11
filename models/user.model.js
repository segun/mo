const { hashPassword, generateToken, validatePassword, isValidEmail, checkPassword } = require("../helpers/validations");
const status = require('http-status-codes');
const successMessage = {};
const errorMessage = {};
const query = require('./dbQuery');

async function deleteUser(req, res) {
    const userId = req.params.userId;
    const updateQuery = "UPDATE masep.login_user SET enabled = false WHERE id = $1 returning *";
    const values = [userId];
    try {
        const { rows } = await query(updateQuery, values);
        const dbResponse = rows[0];
        delete dbResponse.password;
        return res.status(status.StatusCodes.ACCEPTED).send(dbResponse);
    } catch (error) {
        console.log(error);
        errorMessage.error = 'Operation was not successful';
        return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).send(errorMessage);
    }        
}

async function editUser(req, res) {
    const userId = req.params.userId;
    const username = req.body.username;
    const password = req.body.password;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;

    const hashedPassword = hashPassword(password);

    let updateQuery = "UPDATE masep.login_user SET username = $1, firstname = $2, lastname = $3, email = $4, password = $5 WHERE id = $6 returning *";
    let values = [
        username,
        firstname,
        lastname,      
        email,                  
        hashedPassword,
        userId
    ];
    if (password === undefined || password.length <= 0) {
        updateQuery = "UPDATE masep.login_user SET username = $1, firstname = $2, lastname = $3, email = $4  WHERE ID = $5 returning *";
        values = [
            username,
            firstname,
            lastname,      
            email,
            userId    
        ];
    }

    try {
        const { rows } = await query(updateQuery, values);
        const dbResponse = rows[0];
        delete dbResponse.password;
        return res.status(status.StatusCodes.ACCEPTED).send(dbResponse);
    } catch (error) {
        console.log(error);
        errorMessage.error = 'Operation was not successful';
        return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).send(errorMessage);
    }    
}

async function getById(req, res) {
    const userId = req.params.userId;
    const selectQuery = "SELECT * FROM masep.login_user WHERE id = $1 AND enabled = true";
    const values = [userId];
    try {
        const { rows } = await query(selectQuery, values);
        if(rows.length > 1) {
            errorMessage.error = 'Operation was not successful, Contact Administrator';
            return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).send(errorMessage);            
        }            
        const dbResponse = rows[0];

        return res.status(status.StatusCodes.ACCEPTED).send(dbResponse);

    } catch (error) {
        console.log(error);
        errorMessage.error = 'Operation was not successful, Contact Administrator';
        return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).send(errorMessage);
    }
}

async function getAllUsers(_req, res) {
    const selectQuery = "SELECT * FROM masep.login_user WHERE enabled = true";
    values = [];
    try {
        const { rows } = await query(selectQuery, values);
        const dbResponse = [];
        for (row of rows) {
            delete row.password;
            dbResponse.push(row);
        }

        return res.status(status.StatusCodes.ACCEPTED).send(dbResponse);

    } catch (error) {
        console.log(error);
        errorMessage.error = 'Operation was not successful, Contact Administrator';
        return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).send(errorMessage);
    }
}

async function login(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const selectQuery = "SELECT * FROM masep.login_user WHERE username = $1 AND enabled != false";
    const values = [username];

    try {
        const { rows } = await query(selectQuery, values);
        if (rows.length === 0) {
            errorMessage.error = "Invalid User: Email";
            return res.status(status.StatusCodes.NOT_FOUND).send(errorMessage);
        }

        const dbResponse = rows[0];
        if (checkPassword(password, dbResponse.password)) {
            delete dbResponse.password;
            const token = generateToken(dbResponse.username, dbResponse.password);
            dbResponse.token = token;
            return res.status(status.StatusCodes.ACCEPTED).send(dbResponse);
        } else {
            errorMessage.error = "Invalid User: Password";
            return res.status(status.StatusCodes.NOT_FOUND).send(errorMessage);
        }
    } catch (error) {
        console.log(error);
        errorMessage.error = 'Operation was not successful, Contact Administrator';
        return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).send(errorMessage);
    }
}

async function addNewUser(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;

    if (!validatePassword(password)) {
        errorMessage.error = 'Invalid Password';
        return res.status(status.StatusCodes.BAD_REQUEST).send(errorMessage);
    }
    if (!isValidEmail(email)) {
        errorMessage.error = 'Invalid Email Address';
        return res.status(status.StatusCodes.BAD_REQUEST).send(errorMessage);
    }

    const hashedPassword = hashPassword(password);
    const createUserQuery = `INSERT INTO masep.login_user(email, firstname, lastname, username, password, enabled) VALUES($1, $2, $3, $4, $5, $6) returning *`;
    const values = [
        email,
        firstname,
        lastname,
        username,
        hashedPassword,
        true
    ];

    try {
        const { rows } = await query(createUserQuery, values);
        const dbResponse = rows[0];
        delete dbResponse.password;
        successMessage.data = dbResponse;
        return res.status(status.StatusCodes.CREATED).send(successMessage);
    } catch (error) {
        console.log(error);
        if (error.routine === '_bt_check_unique') {
            errorMessage.error = 'User with that EMAIL and/or USERNAME already exist';
            return res.status(status.StatusCodes.CONFLICT).send(errorMessage);
        }
        errorMessage.error = 'Operation was not successful';
        return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).send(errorMessage);
    }
}

module.exports = {
    addNewUser,
    login,
    getAllUsers,
    getById,
    editUser,
    deleteUser,
};