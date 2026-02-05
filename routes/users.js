var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

var emailUser = process.env.EMAIL_USER;
var emailPass = process.env.EMAIL_PASS;
var contactTo = process.env.CONTACT_TO || emailUser;

function createTransporter() {
  if (!emailUser || !emailPass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
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

  var transporter = createTransporter();

  if (!transporter || !contactTo) {
    return res.status(500).json({
      success: false,
      error: 'Email service is not configured. Set EMAIL_USER and EMAIL_PASS.',
    });
  }

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${emailUser}>`,
      to: contactTo,
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
    console.error('Email send failed:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

module.exports = router;
