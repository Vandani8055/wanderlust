const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // your Gmail address
    pass: process.env.EMAIL_PASS   // App Password generated in Gmail
  }
});

const sendWelcomeEmail =  async(toEmail, name) => {
  const mailOptions = {
    from: `"Wanderlust" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Welcome to Wanderlust!",
    html: `<h2>Hello ${name || "there"} 👋</h2>
           <p>Thank you for signing up for Wanderlust. We are excited to have you on board!</p>
           <p>Start exploring amazing listings now.</p>`,
  };

  await transporter.sendMail(mailOptions);



  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Error sending email:", err);
    } else {
      console.log("Email sent successfully:", info.response);
    }
  });
};

module.exports = sendWelcomeEmail;
