const fs = require('fs');

let code = fs.readFileSync('src/components/dmo/DMODashboard.tsx', 'utf8');

// Swap tab labels
code = code.replace(
  /<span>3\. AI Stock Resupply & UCP Procurement Hub/,
  '<span>4. AI Stock Resupply & UCP Procurement Hub'
);

code = code.replace(
  /<span>4\. Govt Hospitals & Specialist Duty Roster/,
  '<span>3. Govt Hospitals & Specialist Duty Roster'
);

fs.writeFileSync('src/components/dmo/DMODashboard.tsx', code);
console.log('DMO Dashboard numbering patched');
