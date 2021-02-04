const { isValidEmail } = require("../helpers/validations");
const successMessage = {};
const errorMessage = {};
const query = require('./dbQuery');
const status = require('http-status-codes');

async function deleteOffender(req, res) {
    const offenderId = req.params.offenderId;
    const updateQuery = "UPDATE masep.offender SET archived = true WHERE id = $1 returning *";
    const values = [offenderId];
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

async function completeClass(req, res) {
    const offenderId = req.params.offenderId;
    const updateQuery = "UPDATE masep.offender SET archived = true, status = 'Completed', completedat = $2 WHERE id = $1 returning *";
    const values = [offenderId, new Date()];
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

async function editOffender(req, res) {
    const offenderId = req.params.offenderId;
    const email = req.body.email;
    const courtorderid = req.body.courtorderid;
    const firstname = req.body.firstname;
    const middlename = req.body.middlename;
    const lastname = req.body.lastname;
    const phonenumber = req.body.phonenumber;
    const clas = req.body.class;
    const year = req.body.year;
    const updatedAt = new Date();

    if (!isValidEmail(email)) {
        errorMessage.error = 'Invalid Email Address';
        return res.status(status.StatusCodes.BAD_REQUEST).send(errorMessage);
    }

    const updateQuery = `UPDATE masep.offender SET
            email = $1, 
            courtorderid = $2, 
            firstname = $3, 
            middlename = $4, 
            lastname = $5, 
            phonenumber = $6, 
            class = $7, 
            year = $8, 
            updatedat = $9 
            WHERE id = $10 AND archived = false returning *`
    const values = [
        email,
        courtorderid,
        firstname,
        middlename,
        lastname,
        phonenumber,
        clas,
        year,
        updatedAt,
        offenderId,
    ];

    try {
        const { rows } = await query(updateQuery, values);
        const dbResponse = rows[0];
        return res.status(status.StatusCodes.ACCEPTED).send(dbResponse);
    } catch (error) {
        console.log(error);
        errorMessage.error = 'Operation was not successful';
        return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).send(errorMessage);
    }
}

async function getById(req, res) {
    const offenderId = req.params.offenderId;
    const selectQuery = "SELECT * FROM masep.offender WHERE id = $1 AND archived = false";
    const values = [offenderId];
    try {
        const { rows } = await query(selectQuery, values);
        if (rows.length > 1) {
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

async function getAllOffenders(_req, res) {
    const selectQuery = "SELECT * FROM masep.offender WHERE archived = false ORDER BY createdat asc";
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

async function addNewOffender(req, res) {
    const email = req.body.email;
    const courtorderid = req.body.courtorderid;
    const firstname = req.body.firstname;
    const middlename = req.body.middlename;
    const lastname = req.body.lastname;
    const phonenumber = req.body.phonenumber;
    const clas = req.body.class;
    const year = req.body.year;
    const archived = false;
    const createdAt = new Date();
    const updatedAt = new Date();
    const offenderStatus = "InProgess";

    if (!isValidEmail(email)) {
        errorMessage.error = 'Invalid Email Address';
        return res.status(status.StatusCodes.BAD_REQUEST).send(errorMessage);
    }

    const createOffenderQuery = `INSERT INTO masep.offender(
                email, courtorderid, firstname, middlename, lastname, phonenumber, class, year, archived, createdat, updatedat, status) 
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) returning *`;
    const values = [
        email,
        courtorderid,
        firstname,
        middlename,
        lastname,
        phonenumber,
        clas,
        year,
        archived,
        createdAt,
        updatedAt,
        offenderStatus
    ];

    try {
        const { rows } = await query(createOffenderQuery, values);
        const dbResponse = rows[0];
        delete dbResponse.password;
        successMessage.data = dbResponse;
        return res.status(status.StatusCodes.CREATED).send(successMessage);
    } catch (error) {
        console.log(error);
        if (error.routine === '_bt_check_unique') {
            errorMessage.error = 'Offender with that EMAIL/Court ID/Phone Number already exist';
            return res.status(status.StatusCodes.CONFLICT).send(errorMessage);
        }
        errorMessage.error = 'Operation was not successful';
        return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).send(errorMessage);
    }
}

module.exports = {
    addNewOffender,
    getAllOffenders,
    getById,
    editOffender,
    deleteOffender,
    completeClass,
};