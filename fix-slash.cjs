const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.astro') || file.endsWith('.md')) {
        results.push(file);
      }
    }
  });
  return results;
}
const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  const original = content;

  // We want to change \$\{import\.meta\.env\.BASE_URL\}something to \$\{import\.meta\.env\.BASE_URL\}/something
  // But be careful not to match \$\{import\.meta\.env\.BASE_URL\}/something if it already has a slash
  // And be careful about \$\{import\.meta\.env\.BASE_URL\} (no following text), which is fine.
  
  content = content.replace(/\$\{import\.meta\.env\.BASE_URL\}(?!\/)/g, () => {
    changed = true;
    return '${import.meta.env.BASE_URL}/';
  });

  if (changed && original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Added slash in', file);
  }
});
