const fs = require("fs");
const nodemailer = require("nodemailer");

function sendEmailWithAttachment(email, tempBookId) {
  return new Promise((resolve, reject) => {
    nodemailer.createTestAccount((err, testAccount) => {
      if (err) {
        reject(err);
        return;
      }

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "PDF with QR Code",
        text: "Hello,\n\nYou have successfully completed your booking. Please find the PDF with QR code attached.",
        attachments: [
          {
            filename: `${tempBookId}.pdf`,
            path: `pdf/${tempBookId}.pdf`,
          },
        ],
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          console.log("Email sent:", info.response);

          // Log URL for viewing the sent email in Ethereal
          //console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

          resolve();
        }
      });
    });
  });
}

module.exports = sendEmailWithAttachment;
