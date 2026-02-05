var express = require('express');
var https = require('https');
var nodemailer = require('nodemailer');

var router = express.Router();

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
    smtpConnectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
    smtpGreetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
    smtpSocketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 15000),
    resendApiKey: process.env.RESEND_API_KEY,
    resendFrom: process.env.RESEND_FROM,
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
    connectionTimeout: config.smtpConnectionTimeout,
    greetingTimeout: config.smtpGreetingTimeout,
    socketTimeout: config.smtpSocketTimeout,
  });
}

function sendWithResend(config, payload) {
  return new Promise(function (resolve, reject) {
    if (!config.resendApiKey || !config.resendFrom || !config.contactTo) {
      return reject(new Error('Resend is not configured'));
    }

    var body = JSON.stringify({
      from: config.resendFrom,
      to: [config.contactTo],
      reply_to: payload.replyTo,
      subject: payload.subject,
      html: payload.html,
    });

    var req = https.request(
      {
        hostname: 'api.resend.com',
        path: '/emails',
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + config.resendApiKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: 10000,
      },
      function (res) {
        var chunks = '';
        res.on('data', function (chunk) {
          chunks += chunk;
        });

        res.on('end', function () {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            return resolve();
          }

          reject(new Error('Resend API error ' + res.statusCode + ': ' + chunks));
        });
      }
    );

    req.on('timeout', function () {
      req.destroy(new Error('Resend API timeout'));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
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
  var mailPayload = {
    from: `"Portfolio Contact" <${config.emailUser || config.resendFrom || 'no-reply@portfolio.local'}>`,
    to: config.contactTo,
    replyTo: email,
    subject: 'New Portfolio Message',
    html: `
      <h3>New Message</h3>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Message:</b><br>${message}</p>
    `,
  };

  var transporter = createTransporter(config);

  try {
    if (transporter && config.contactTo) {
      await transporter.sendMail(mailPayload);
      return res.json({ success: true, provider: 'smtp' });
    }

    await sendWithResend(config, {
      replyTo: email,
      subject: mailPayload.subject,
      html: mailPayload.html,
    });

    return res.json({ success: true, provider: 'resend' });
  } catch (err) {
    console.error('Email send failed:', err.message, { code: err.code, command: err.command });

    if (!config.contactTo || (!transporter && !config.resendApiKey)) {
      return res.status(500).json({
        success: false,
        error: 'Email service is not configured. Set CONTACT_TO and SMTP or RESEND credentials.',
      });
    }

    return res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

module.exports = router;
