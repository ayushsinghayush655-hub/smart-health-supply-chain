const fs = require('fs');
let code = fs.readFileSync('src/components/phc/PHCDashboard.tsx', 'utf8');

// Replace lines 707 to 736 inclusive
const lines = code.split('\n');
const fixedLines = lines.filter((_, i) => i < 706 || i > 736);

fs.writeFileSync('src/components/phc/PHCDashboard.tsx', fixedLines.join('\n'));
console.log('PHCDashboard fixed');
