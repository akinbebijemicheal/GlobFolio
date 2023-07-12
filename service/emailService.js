require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME, // generated ethereal user
    pass: process.env.EMAIL_PASSWORD // generated ethereal password
  }
});

console.log("entering email")
  transporter
    .verify()
    .then(() => console.log("Connected to email server"))
    .catch(() =>
      console.log(
        "Unable to connect to email server. Make sure you have configured the SMTP options in .env"
      )
    );

exports.sendMail = async (email, message, subject, files = []) => {
  try {
    // send mail with defined transport object
    const mailOptions = {
      from: `${process.env.APP_NAME} <${process.env.EMAIL_FROM}>`, // sender address
      to: email, // list of receivers
      subject, // Subject line
      text: "IWTYS LTD", // plain text body
      html: message, // html body
      attachments: files
    };
    transporter.sendMail(mailOptions, async (err, info) => {
      if (err) {
        console.log(err, "Error Sending mail");
      } else {
        console.log(info, "Email Sent succesfully");
      }
    });
  } catch (error) {
    console.error(error);
  }
};
