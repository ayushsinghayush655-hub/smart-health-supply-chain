const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// fix multimodal part
code = code.replace(
  /contents:\s*\{\s*parts:\s*\[\s*\{\s*inlineData:\s*\{\s*data:\s*cleanBase64,\s*mimeType:\s*mimeType \|\| 'image\/jpeg',\s*\},\s*\},\s*\{\s*text:\s*prompt\s*\},\s*\],\s*\}/,
  "contents: [\n              { inlineData: { data: cleanBase64, mimeType: mimeType || 'image/jpeg' } },\n              { text: prompt }\n            ]"
);

fs.writeFileSync('server.ts', code);
console.log('Patched server.ts');
