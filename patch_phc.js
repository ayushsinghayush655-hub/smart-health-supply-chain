const fs = require('fs');
let code = fs.readFileSync('src/components/phc/PHCDashboard.tsx', 'utf8');

code = code.replace(/MOIC ID:/g, 'PHC ID:');
code = code.replace(/MOIC: <strong>/g, 'PHC ID: <strong>');

fs.writeFileSync('src/components/phc/PHCDashboard.tsx', code);
console.log('PHC Dashboard patched with PHC ID');
