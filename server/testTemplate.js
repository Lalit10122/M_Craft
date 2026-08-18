import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, './.env');
dotenv.config({ path: envPath });

import { buildEmail } from './src/utils/emailTemplate.js';

(async () => {
  const html = await buildEmail({
    title: 'Welcome to Malkincraft',
    headerTitle: 'Welcome to the Family',
    preheader: 'Discover handcrafted perfection.',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Hi Lalit,</mj-text>
      <mj-text>Welcome to Malkincraft! We are thrilled to have you here.</mj-text>
    `,
    ctaText: 'Start Shopping',
    ctaUrl: 'https://malkincraft.com'
  });
  console.log(html.substring(0, 500));
})();
