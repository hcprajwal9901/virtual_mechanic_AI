const fs = require('fs');
const path = require('path');

const distIndex = path.join(__dirname, '..', 'dist', 'index.html');
const dist404 = path.join(__dirname, '..', 'dist', '404.html');

if (!fs.existsSync(distIndex)) {
  console.error("index.html not found in dist. Run 'npm run build' first.");
  process.exit(1);
}

fs.copyFileSync(distIndex, dist404);
console.log("✔ Created 404.html for GitHub Pages!");
