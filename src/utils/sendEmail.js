const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465, // Secure for port 465 (SSL)
      auth: {
        user: process.env.ADMIN_EMAIL, // SMTP authentication email
        pass: process.env.ADMIN_PASSWORD, // SMTP authentication password
      },
    });

    const mailOptions = {
      from: `"Archana Gallery" <${process.env.ADMIN_EMAIL}>`,
      to: email, // Recipient email
      subject: subject, // Email subject
      html: htmlContent, // HTML content for email body
    };
    console.log("🚀 ~ sendEmail ~ mailOptions:", mailOptions);

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email. Please try again.");
  }
};

module.exports = sendEmail;
