// pages/api/contact.js

import { IncomingForm } from 'formidable';
import nodemailer from 'nodemailer';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new IncomingForm();

  try {
    const fields = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields) => {
        if (err) reject(err);
        else resolve(fields);
      });
    });

    const { firstName, lastName, email, message } = fields;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.RECIPIENT_EMAIL,
      subject: `New Message from ${firstName} ${lastName}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Message sent successfully!' });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
}
