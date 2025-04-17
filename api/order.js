import { IncomingForm } from 'formidable';
import nodemailer from 'nodemailer';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new IncomingForm();

    try {
      const fields = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields) => {
          if (err) reject(err);
          else resolve(fields);
        });
      });

      const {
        firstName,
        lastName,
        email,
        chocoQty,
        macadamiaQty,
        bundleQty,
        notes
      } = fields;

      if (!firstName || !lastName || !email) {
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
        subject: `New Cookie Order from ${firstName} ${lastName}`,
        html: `
          <h2>New Order</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Chocolate Chip Cookies:</strong> ${chocoQty || 0}</p>
          <p><strong>Macadamia Cookies:</strong> ${macadamiaQty || 0}</p>
          <p><strong>Cookie Bundles:</strong> ${bundleQty || 0}</p>
          <p><strong>Special Requests:</strong> ${notes || 'None'}</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: 'Order submitted successfully!' });

    } catch (error) {
      console.error('Server error:', error);
      return res.status(500).json({ error: 'Server error while processing order.' });
    }

  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
