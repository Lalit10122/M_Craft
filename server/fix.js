import fs from 'fs';

const p = 'e:/Malkincraft/server/src/services/emailService.js';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(/\\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync(p, content);
console.log('Fixed emailService.js');
