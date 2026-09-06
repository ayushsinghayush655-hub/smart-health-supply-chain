const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// replace the first instance (which is in the image extraction block)
code = code.replace(
  /model: 'gemini-2\.5-flash'/,
  "model: 'gemini-3.8-flash'"
);

fs.writeFileSync('server.ts', code);
console.log('Model Patched');
