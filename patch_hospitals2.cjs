const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /activeDoctors:\s*48,\s*\n\s*totalDoctors:\s*52,\s*\n\s*\}/g,
  "activeDoctors: 48,\n    totalDoctors: 52,\n    specialistsByDepartment: { 'Cardiology': 4, 'Pediatrics': 8, 'General Surgery': 6, 'Orthopedics': 5, 'Gynecology': 7 }\n  }"
);
code = code.replace(
  /activeDoctors:\s*24,\s*\n\s*totalDoctors:\s*28,\s*\n\s*\}/g,
  "activeDoctors: 24,\n    totalDoctors: 28,\n    specialistsByDepartment: { 'Pediatrics': 10, 'General Medicine': 5, 'Gynecology': 9 }\n  }"
);
code = code.replace(
  /activeDoctors:\s*18,\s*\n\s*totalDoctors:\s*22,\s*\n\s*\}/g,
  "activeDoctors: 18,\n    totalDoctors: 22,\n    specialistsByDepartment: { 'Trauma': 8, 'Orthopedics': 6, 'Anesthesia': 4 }\n  }"
);

fs.writeFileSync('server.ts', code);
console.log('Hospitals patched.');
