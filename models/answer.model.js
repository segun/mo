const { isValidEmail } = require("../helpers/validations");
const successMessage = {};
const errorMessage = {};
const query = require('./dbQuery');
const status = require('http-status-codes');


async function checkAvailability(req, res) {
    const email = req.params.email;
    const selectQuery = "SELECT * FROM masep.user_score WHERE email = $1";
    const values = [email];
    try {
        const { rows } = await query(selectQuery, values);
        return res.status(status.StatusCodes.ACCEPTED).send(rows.length < 1);
    } catch (error) {
        console.log(error);
        errorMessage.error = 'Operation was not successful, Contact Administrator';
        return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).send(errorMessage);
    }
}

async function submitAnswers(req, res) {
    let sum = 0;
    try {
        const keys = Object.keys(req.body);

        keys.forEach(async (key) => {
            answer = req.body[key];

            if (answer.is_correct) {
                sum++;
            }
            const inserAnswerQuery = "INSERT INTO masep.user_answers (email, question_id, answer, is_correct) VALUES ($1, $2, $3, $4) returning *";
            const values = [
                answer.email,
                answer.question_id,
                answer.answer,
                answer.is_correct
            ];

            await query(inserAnswerQuery, values);
        });

        const insertScoreQuery = "INSERT INTO masep.user_score (email, score) VALUES ($1, $2) returning *";
        const values = [answer.email, sum];
        await query(insertScoreQuery, values);

        successMessage.message = "Answers Submitted Successfully";        


        // TODO: 
        // Send Email to specified address

        const cutoffQuery = "SELECT value FROM masep.settings WHERE name = 'cutoff_mark'";
        const {rows} = await query(cutoffQuery, []);
        const row = rows[0];
        if(row.value === undefined) {
            errorMessage.error = 'Cutoff Mark is not defined';
            console.log(errorMessage);
            return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).send(errorMessage);            
        } else {
            successMessage.passedCutoff = sum >= row.value;
        }

        return res.status(status.StatusCodes.CREATED).send(successMessage);
    } catch (error) {
        console.log(error);
        errorMessage.error = 'Operation was not successful';
        return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).send(errorMessage);
    }
}

module.exports = {
    checkAvailability,
    submitAnswers
};
