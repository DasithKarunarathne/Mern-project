// backend-product/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    // Check if email credentials are provided in the .env file
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials are missing. Please set EMAIL_USER and EMAIL_PASS in your .env file.');
    }

    // Create a transporter using Gmail's SMTP server
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER, // e.g., shenukaminoli22@gmail.com
        pass: process.env.EMAIL_PASS, // Your Gmail App Password
      },
    });

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to, // Recipient address (customer's email)
      subject, // Email subject
      text, // Email body (plain text)
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;