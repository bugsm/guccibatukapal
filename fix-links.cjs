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

  content = content.replace(/href=\"\/\"/g, () => {
    changed = true;
    return 'href={import.meta.env.BASE_URL}';
  });

  content = content.replace(/href=\"\/([^\"]+)\"/g, (match, p1) => {
    if (p1.startsWith('{')) return match;
    changed = true;
    return 'href={`${import.meta.env.BASE_URL}' + p1 + '`}';
  });

  content = content.replace(/src=\"\/([^\"]+)\"/g, (match, p1) => {
    if (p1.startsWith('{')) return match;
    changed = true;
    return 'src={`${import.meta.env.BASE_URL}' + p1 + '`}';
  });

  if (changed && original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
})
