import { Router } from 'express';
import { sendZohoEmail } from '../lib/zohoMail';
import { sendEmail } from '../lib/sendEmail';

export const publicapi = Router();

publicapi.post('/contact', async (req, res) => {
  if (!req.body['email']) {
    return res.status(400).send('Email is required');
  }
  const token = req.body['g-recaptcha-response'];

  const secret = process.env.CAPTCHA_SECRET_KEY;

  if (!token) {
    return res.status(400).send('No CAPTCHA token provided');
  }

  let captchaSuccess = false;

  try {
    const verifyResponse = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${secret}&response=${token}`,
      }
    );

    const data = await verifyResponse.json();
    if (data.success) {
      captchaSuccess = true;
    } else {
    }
  } catch (error) {
    return res.status(500).send('Error verifying CAPTCHA');
  }

  if (captchaSuccess) {
    const { email, name, phone, message } = req.body;

    const subject = `ServeTab Interested - ${email}`;
    const text = `
    You have a new message from a potential client via the ServeTab contact form.
    Name: ${name || 'N/A'}
    Email: ${email}
    Phone: ${phone || 'N/A'}
    Message:
    ${message || 'No message provided.'}`;

    sendEmail({ to: 'sakis475@gmail.com', subject, text, html: text });

    res.send();
  } else {
    return res.status(400).send('CAPTCHA verification failed');
  }
});
function cors(): any {
  throw new Error('Function not implemented.');
}
