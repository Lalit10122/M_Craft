import 'dotenv/config';
import nodemailer from 'nodemailer';

async function testEmail() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  
  if (!host || !user || !pass) {
    console.error("Missing SMTP credentials in .env");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    console.log(`Connecting to ${host} as ${user}...`);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM_ADDRESS || user,
      to: 'lalitpatharia10122@gmail.com', // Send to requested email
      subject: 'Test Email from Malkincraft',
      text: 'Hello! Your SMTP configuration is working perfectly.',
      html: '<b>Hello!</b> Your SMTP configuration is working perfectly.'
    });
    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
}

testEmail();
