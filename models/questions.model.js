const { isValidEmail } = require("../helpers/validations");
const successMessage = {};
const errorMessage = {};
const query = require('./dbQuery');
const status = require('http-status-codes');


async function getAllQuestions(_req, res) {
    const selectQuery = "SELECT * FROM masep.questions";
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

async function addNewQuestion(req, res) {
    const question = req.body.question;
    const answer = req.body.answer;
    const image_url = req.body.image_url;
    const option_a = req.body.option_a;
    const option_b = req.body.option_b;
    const option_c = req.body.option_c;
    const option_d = req.body.option_d;
    const option_e = req.body.option_e;

    const createQuestionQuery = `INSERT INTO masep.questions (
        question, answer, image_url, option_a, option_b, option_c, option_d, option_e
    ) VALUES($1, $2, $3, $4, $5, $6, $7, $8) returning *`;
    const values = [
        question, answer, image_url, option_a, option_b, option_c, option_d, option_e
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

module.exports = {
    addNewQuestion,
    getAllQuestions
};
