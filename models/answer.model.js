const { isValidEmail } = require("../helpers/validations");
const successMessage = {};
const errorMessage = {};
const query = require('./dbQuery');
const status = require('http-status-codes');
const nodemailer = require('nodemailer');
const props = require('../config');
const { toNumber } = require("lodash");

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

async function submitContactForm(req, res) {
    // TODO Send Email To Admin

    const selectQuery = "SELECT value FROM masep.settings WHERE name = 'admin_email'";
    const values = [];
    try {
        const { rows } = await query(selectQuery, values);
        const adminEmail = rows[0].value;

        const mailText = `
        <h3>New User Registration</h3><br />
        <h4>Email Address: ${req.body.email}</h4><br />
        <h4>Phone Number: ${req.body.phoneNumber}</h4><br />
        <h4>Full Name: ${req.body.fullName}</h4><br />`;

        const transpoter = nodemailer.createTransport(props.email);
        const mailOptions = {
            from: props.email.from,
            to: adminEmail,
            subject: 'New user Registration',
            html: mailText
        }

        transpoter.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw (error);
            } else {
                successMessage.message = "Contact Information Saved Successfully";
                return res.status(status.StatusCodes.CREATED).send(successMessage);
            }
        });

    } catch (error) {
        console.log(error);
        errorMessage.error = 'Operation was not successful, Contact Administrator';
        return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).send(errorMessage);
    }
}

sendPassedEmail = (email) => {
    const mailText = `
        <h3>You Passed!!!</h3><br />
        <h4>You meet the criteria for online classes. If you are interested, please fill out the contact form on the page. We will be in touch</h4>
        `;
    const transpoter = nodemailer.createTransport(props.email);
    const mailOptions = {
        from: props.email.from,
        to: email,
        subject: 'Masep Computer Test',
        html: mailText
    }

    transpoter.sendMail(mailOptions, (error, info) => {
        if (error) {
            throw (error);
        }
    });
}

sendFailedEmail = (email) => {
    const mailText = `
    <h3>You Didn't meet cutoff mark</h3><br />
    <h4>You are not eligible for online classes. Please contact MASEP at [phone number] to schedule your in-person class.</h4>
    `;
    const transpoter = nodemailer.createTransport(props.email);
    const mailOptions = {
        from: props.email.from,
        to: email,
        subject: 'Masep Computer Test',
        html: mailText
    }

    transpoter.sendMail(mailOptions, (error, info) => {
        if (error) {
            throw (error);
        }
    });
}

async function submitAnswers(req, res) {
    let sum = 0;
    try {
        const keys = Object.keys(req.body);

        keys.forEach(async (key) => {
            answer = req.body[key];

            if (answer.is_correct) {
                sum += toNumber(answer.points);
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

        const cutoffQuery = "SELECT value FROM masep.settings WHERE name = 'cutoff_mark'";
        const { rows } = await query(cutoffQuery, []);
        const row = rows[0];
        if (row.value === undefined) {
            errorMessage.error = 'Cutoff Mark is not defined';
            console.log(errorMessage);
            return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).send(errorMessage);
        } else {
            successMessage.passedCutoff = sum >= toNumber(row.value);
        }

        const insertScoreQuery = "INSERT INTO masep.user_score (email, score, pass, cutoff_used) VALUES ($1, $2, $3, $4) returning *";
        const values = [answer.email, sum, successMessage.passedCutoff, row.value];
        await query(insertScoreQuery, values);

        successMessage.message = "Answers Submitted Successfully";
        
        if (successMessage.passedCutoff) {
            sendPassedEmail(answer.email);
        } else {
            sendFailedEmail(answer.email);
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
    submitAnswers,
    submitContactForm
};
