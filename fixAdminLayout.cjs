const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'frontend/src/pages/admin');
const dashboardsDir = path.join(__dirname, 'frontend/src/pages/admin/dashboards');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace common page headers
  const headerRegex = /<div style=\{\{\s*display:\s*'flex',\s*justifyContent:\s*'space-between',\s*alignItems:\s*'center',\s*marginBottom:\s*'24px'\s*\}\}>/g;
  if (headerRegex.test(content)) {
    content = content.replace(headerRegex, '<div className="admin-header-row">');
    changed = true;
  }

  // Replace stat cards flex rows
  const cardRegex = /<div style=\{\{\s*background:\s*'white',\s*padding:\s*'24px',\s*borderRadius:\s*'12px',\s*display:\s*'flex',\s*alignItems:\s*'flex-start',\s*justifyContent:\s*'space-between',\s*border:\s*'1px solid #eaeaea'(?:,\s*opacity:[^,]+,\s*transition:[^}]+)?\s*\}\}>/g;
  if (cardRegex.test(content)) {
    content = content.replace(cardRegex, '<div className="admin-stat-card">');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(adminDir);
