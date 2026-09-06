const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /if \(\!aiSuccess\) \{\s*throw new Error\("Gemini AI failed to process the request due to high demand or API issues\. Please try again later\."\);\s*\}/,
  'if (!aiSuccess) {\n      return res.status(503).json({ error: "Gemini AI failed to process the request due to high demand or API issues. Please try again later." });\n    }'
);

fs.writeFileSync('server.ts', code);
console.log('Error handling patched.');
