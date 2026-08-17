const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (!file.endsWith('.jsx')) return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('<table') && !content.includes('table-responsive-wrapper')) {
    // We want to wrap the table in a div
    // Find <table and replace with <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto' }}><table
    // Find </table> and replace with </table></div>
    content = content.replace(/(<table[\s\S]*?<\/table>)/g, '<div className="table-responsive-wrapper" style={{ width: \'100%\', overflowX: \'auto\' }}>\n$1\n</div>');
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
