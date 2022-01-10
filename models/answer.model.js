const { isValidEmail } = require("../helpers/validations");
const successMessage = {};
const errorMessage = {};
const query = require("./dbQuery");
const status = require("http-status-codes");
const nodemailer = require("nodemailer");
const props = require("../config");
const { toNumber } = require("lodash");

async function checkAvailability(req, res) {
  const email = req.params.email;
  const selectQuery = "SELECT * FROM masep.user_score WHERE email = $1";
  const values = [email];
  let canTakeExam = false;

  try {
    const { rows } = await query(selectQuery, values);
    if (rows.length <= 0) {
      const insertScoreQuery =
        "INSERT INTO masep.user_score (email, score, pass, cutoff_used, date_started) VALUES ($1, $2, $3, $4, $5) returning *";
      const values = [email, -1, false, -1, new Date()];
      await query(insertScoreQuery, values);
      canTakeExam = true;
    } else if (
      rows.length > 0 &&
      rows[0].score < 0 &&
      rows[0].cutoff_used < 0
    ) {
      canTakeExam = true;
    } else {
      canTakeExam = false;
    }

    const dateStarted =
      rows.length === 1 ? new Date(rows[0].date_started).getTime() : 0;
    return res.status(status.StatusCodes.ACCEPTED).send({
      canTakeExam: canTakeExam,
      dateStarted: dateStarted,
    });
  } catch (error) {
    console.log(error);
    errorMessage.error = "Operation was not successful, Contact Administrator";
    return res
      .status(status.StatusCodes.INTERNAL_SERVER_ERROR)
      .send(errorMessage);
  }
}

async function uploadFile(email, path) {
  const insertFileUploadQuery =
    "INSERT INTO masep.file_uploads (path, email) VALUES ($1, $2)";

  const updateFileUploadQuery =
    "UPDATE masep.file_uploads SET path = $1 WHERE email = $2";

  const insertValues = [path, email];

  try {
    await query(insertFileUploadQuery, insertValues);
  } catch (err) {
    await query(updateFileUploadQuery, insertValues);
  }

  return true;
}

async function submitContactForm(req, res) {
  // TODO Send Email To Admin
  const selectQuery =
    "SELECT value FROM masep.settings WHERE name = 'admin_email'";

  const selectFileUploadIdQuery = `SELECT id, path FROM masep.file_uploads WHERE email = '${req.body.email}'`;

  console.log(selectFileUploadIdQuery);

  try {
    const { rows } = await query(selectQuery);
    const adminEmail = rows[0].value;

    const { rows: fuRows } = await query(selectFileUploadIdQuery);

    console.log(fuRows);

    let fuId = 0;
    const fuPath = fuRows[0].path;

    if (fuRows && fuRows.length > 0) {
      fuId = fuRows[0].id;
    }

    const mailText = `
        <h3>New User Registration</h3><br />
        <h4>Email Address: ${req.body.email}</h4><br />
        <h4>Phone Number: ${req.body.phoneNumber}</h4><br />
        <h4>Full Name: ${req.body.fullName}</h4><br />
        <h4>Full Reason: ${req.body.reason}</h4><br />`;

    const transpoter = nodemailer.createTransport(props.email);
    const mailOptions = {
      from: props.email.from,
      to: adminEmail,
      subject: "New user Registration",
      html: mailText,
      attachments: [],
    };

    let insertContactFormQuery =
      "INSERT INTO masep.contact_form (email, phonenumber, fullname, reason, fileuploadid) VALUES ($1, $2, $3, $4, $5) returning *";
    let values = [
      req.body.email,
      req.body.phoneNumber,
      req.body.fullName,
      req.body.reason,
      fuId,
    ];

    if (fuId === 0) {
      insertContactFormQuery =
        "INSERT INTO masep.contact_form (email, phonenumber, fullname, reason) VALUES ($1, $2, $3, $4) returning *";
      values = [
        req.body.email,
        req.body.phoneNumber,
        req.body.fullName,
        req.body.reason,
      ];
    } else {
      mailOptions.attachments.push({
        filename: "courtorder.pdf",
        path: fuPath,
        contentType: "application/pdf",
      });
    }

    await query(insertContactFormQuery, values);

    try {
      transpoter.sendMail(mailOptions, (error, info) => {
        if (error) {
          throw error;
        }
      });
    } catch (err) {
      console.log(error);
      errorMessage.error =
        "Operation was not successful, Contact Administrator";
      return res
        .status(status.StatusCodes.INTERNAL_SERVER_ERROR)
        .send(errorMessage);
    }

    successMessage.message = "Contact Information Saved Successfully";
    return res.status(status.StatusCodes.CREATED).send(successMessage);
  } catch (error) {
    console.log(error);
    errorMessage.error = "Operation was not successful, Contact Administrator";
    return res
      .status(status.StatusCodes.INTERNAL_SERVER_ERROR)
      .send(errorMessage);
  }
}

sendPassedEmail = (email) => {
  const mailText = `
        <h3>You Passed!!!</h3><br />
        <h4>Thank you for your interest in MASEP Online. Please be advised that this is not an on-demand class. It adheres to a schedule the same as the in-person classes. Someone will be in touch within the next two weeks. Please be prepared to pay the $250 registration fee at that time.</h4>
        `;
  const transpoter = nodemailer.createTransport(props.email);
  const mailOptions = {
    from: props.email.from,
    to: email,
    subject: "Masep Computer Test",
    html: mailText,
  };

  transpoter.sendMail(mailOptions, (error, info) => {
    if (error) {
      throw error;
    }
  });
};

sendFailedEmail = (email) => {
  const mailText = `
    <h3>You Didn't meet cutoff mark</h3><br />
    <h4>You are not eligible for online classes. Please contact MASEP at [phone number] to schedule your in-person class.</h4>
    `;
  const transpoter = nodemailer.createTransport(props.email);
  const mailOptions = {
    from: props.email.from,
    to: email,
    subject: "Masep Computer Test",
    html: mailText,
  };

  transpoter.sendMail(mailOptions, (error, info) => {
    if (error) {
      throw error;
    }
  });
};

async function submitAnswers(req, res) {
  let sum = 0;
  try {
    const keys = Object.keys(req.body);

    keys.forEach(async (key) => {
      answer = req.body[key];

      if (answer.is_correct) {
        sum += toNumber(answer.points);
      }
      const inserAnswerQuery =
        "INSERT INTO masep.user_answers (email, question_id, answer, is_correct) VALUES ($1, $2, $3, $4) returning *";
      const values = [
        answer.email,
        answer.question_id,
        answer.answer,
        answer.is_correct,
      ];

      await query(inserAnswerQuery, values);
    });

    const cutoffQuery =
      "SELECT value FROM masep.settings WHERE name = 'cutoff_mark'";
    const { rows } = await query(cutoffQuery, []);
    const row = rows[0];
    if (row.value === undefined) {
      errorMessage.error = "Cutoff Mark is not defined";
      console.log(errorMessage);
      return res
        .status(status.StatusCodes.INTERNAL_SERVER_ERROR)
        .send(errorMessage);
    } else {
      successMessage.passedCutoff = sum >= toNumber(row.value);
    }

    const updateScoreQuery =
      "UPDATE masep.user_score set score = $2, pass = $3, cutoff_used = $4, date_taken = $5 WHERE email = $1";
    const values = [
      answer.email,
      sum,
      successMessage.passedCutoff,
      row.value,
      new Date(),
    ];
    await query(updateScoreQuery, values);

    successMessage.message = "Answers Submitted Successfully";

    if (successMessage.passedCutoff) {
      sendPassedEmail(answer.email);
    } else {
      // sendFailedEmail(answer.email);
    }

    return res.status(status.StatusCodes.CREATED).send(successMessage);
  } catch (error) {
    console.log(error);
    errorMessage.error = "Operation was not successful";
    return res
      .status(status.StatusCodes.INTERNAL_SERVER_ERROR)
      .send(errorMessage);
  }
}

module.exports = {
  checkAvailability,
  submitAnswers,
  submitContactForm,
  uploadFile,
};
