const nodemailer = require('nodemailer');

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: 'smtp.eu.mailgun.org',
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: 'postmaster@servetab.app',
    pass: '9fd25550264be43c78e51c6ea9be8e74-3af52e3b-95864e05',
  },
});

export const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `ServeTab <info@servetab.app>`, // sender address
    to,
    subject,
    text,
    html,
  });

  console.log('Message sent:', info);
  return info;
};
