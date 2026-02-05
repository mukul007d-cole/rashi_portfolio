var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

function getEmailConfig() {
  var emailUser = process.env.EMAIL_USER;
  var emailPass = process.env.EMAIL_PASS;

  return {
    emailUser: emailUser,
    emailPass: emailPass,
    contactTo: process.env.CONTACT_TO || emailUser,
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: Number(process.env.SMTP_PORT || 587),
    smtpSecure: String(process.env.SMTP_SECURE || 'false') === 'true',
  };
}

function createTransporter(config) {
  if (!config.emailUser || !config.emailPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.emailUser,
      pass: config.emailPass,
    },
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 15000),
  });
}

// CONTACT FORM ROUTE
router.post('/contact', async function (req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var message = req.body.message;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  var config = getEmailConfig();
  var transporter = createTransporter(config);

  if (!transporter || !config.contactTo) {
    return res.status(500).json({
      success: false,
      error: 'Email service is not configured. Set EMAIL_USER and EMAIL_PASS.',
    });
  }

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${config.emailUser}>`,
      to: config.contactTo,
      replyTo: email,
      subject: 'New Portfolio Message',
      html: `
        <h3>New Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b><br>${message}</p>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Email send failed:', err.message, { code: err.code, command: err.command });
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

module.exports = router;
