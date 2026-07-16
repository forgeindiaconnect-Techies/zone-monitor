const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}
const files = walk('./src');
let changed = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // First, revert the previous fix where it was replaced with ''
  let newContent = content.replace(/\(window\.location\.hostname === 'localhost' \? 'http:\/\/localhost:5000' : ''\)/g, "(window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://zone-monitor.onrender.com')");
  
  // Do the same for networkIp templates
  newContent = newContent.replace(/\(window\.location\.hostname === 'localhost' \? \`http:\/\/\$\{networkIp\}:5000\` : ''\)/g, "(window.location.hostname === 'localhost' ? `http://${networkIp}:5000` : 'https://zone-monitor.onrender.com')");
  
  if (content !== newContent) {
    fs.writeFileSync(f, newContent);
    changed++;
    console.log('Updated: ' + f);
  }
});
console.log('Total files changed: ' + changed);
