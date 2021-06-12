const { isValidEmail } = require("../helpers/validations");
const successMessage = {};
const errorMessage = {};
const query = require('./dbQuery');
const status = require('http-status-codes');


async function getAllQuestions(_req, res) {
    const selectQuery = "SELECT * FROM masep.questions order by serial_number asc";
    values = [];
    try {
        const { rows } = await query(selectQuery, values);
        const dbResponse = [];
        for (row of rows) {
            dbResponse.push(row);
        }

        return res.status(status.StatusCodes.ACCEPTED).send(dbResponse);

    } catch (error) {
        console.log(error);
        errorMessage.error = 'Operation was not successful, Contact Administrator';
        return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).send(errorMessage);
    }
}

async function editQuestion(req, res) {
    const questionId = req.params.questionId;
    const question = req.body.question;
    const serial_number = req.body.serial_number;
    const answer = req.body.answer;
    const image_url = req.body.image_url;
    const option_a = req.body.option_a;
    const option_b = req.body.option_b;
    const option_c = req.body.option_c;
    const option_d = req.body.option_d;
    const option_e = req.body.option_e;

    const updateQuery = `UPDATE masep.questions SET
            question = $1, 
            answer = $2, 
            image_url = $3, 
            option_a = $4, 
            option_b = $5, 
            option_c = $6, 
            option_d = $7, 
            option_e = $8,
            serial_number = $9
            WHERE id = $10 returning *`
    const values = [
        question, answer, image_url, option_a, option_b, option_c, option_d, option_e, serial_number, questionId        
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

async function addNewQuestion(req, res) {
    const question = req.body.question;
    const serial_number = req.body.serial_number;
    const answer = req.body.answer;
    const image_url = req.body.image_url;
    const option_a = req.body.option_a;
    const option_b = req.body.option_b;
    const option_c = req.body.option_c;
    const option_d = req.body.option_d;
    const option_e = req.body.option_e;

    const createQuestionQuery = `INSERT INTO masep.questions (
        question, answer, image_url, option_a, option_b, option_c, option_d, option_e, serial_number
    ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *`;
    const values = [
        question, answer, image_url, option_a, option_b, option_c, option_d, option_e, serial_number
    ];

    try {
        const { rows } = await query(createQuestionQuery, values);
        const dbResponse = rows[0];
        delete dbResponse.password;
        successMessage.data = dbResponse;
        return res.status(status.StatusCodes.CREATED).send(successMessage);
    } catch (error) {
        console.log(error);
        if (error.routine === '_bt_check_unique') {
            errorMessage.error = 'Question already exists';
            return res.status(status.StatusCodes.CONFLICT).send(errorMessage);
        }
        errorMessage.error = 'Operation was not successful';
        return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).send(errorMessage);
    }
}

async function getById(req, res) {
    const questionId = req.params.questionId;
    const selectQuery = "SELECT * FROM masep.questions WHERE id = $1";
    const values = [questionId];
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

module.exports = {
    addNewQuestion,
    getAllQuestions,
    getById,
    editQuestion
};
