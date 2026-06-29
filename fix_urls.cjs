const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(srcDir);
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Pattern 1: `http://${window.location.hostname}:5000/api/something`
  // We want to replace just `http://${window.location.hostname}:5000` with ${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}
  content = content.replace(/http:\/\/\$\{window\.location\.hostname\}:5000/g, "${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}");
  
  // Pattern 2: "http://localhost:5000/api/something"
  // We replace http://localhost:5000 with ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}
  // But wait, if it was in double quotes, we need to convert the quotes to backticks!
  // To be safe, we just use string concatenation for double quotes, or regex it properly.
  content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");
  content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");

  if (content !== original) {
    fs.writeFileSync(file, content);
    modifiedCount++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`Successfully updated ${modifiedCount} files.`);
