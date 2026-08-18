import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, './.env');

dotenv.config({ path: envPath });

import { sendWelcomeEmail, sendNewLoginAlertEmail } from './src/services/emailService.js';

async function testEmails() {
  const targetEmail = 'lalitpatharia10122@gmail.com';
  
  console.log(`Starting email tests. Target: ${targetEmail}`);
  console.log(`Using SMTP Host: ${process.env.SMTP_HOST}`);
  
  try {
    console.log('1. Sending Welcome Email...');
    await sendWelcomeEmail(targetEmail, 'Lalit');
    console.log('✅ Welcome Email sent successfully!');
    
    console.log('2. Sending Login Alert Email...');
    await sendNewLoginAlertEmail(targetEmail, '192.168.1.1 (Mumbai)', new Date().toLocaleString(), 'Chrome on Windows');
    console.log('✅ Login Alert Email sent successfully!');
    
  } catch (error) {
    console.error('❌ Error sending emails:', error);
  }
  
  console.log('Test completed.');
  process.exit(0);
}

testEmails();
