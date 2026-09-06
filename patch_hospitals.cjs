const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /activeDoctors:\s*45,\n\s*totalDoctors:\s*52,\n\s*\},/g,
  "activeDoctors: 45,\n    totalDoctors: 52,\n    specialistsByDepartment: { 'Cardiology': 4, 'Pediatrics': 8, 'General Surgery': 6, 'Orthopedics': 5, 'Gynecology': 7 }\n  },"
);
code = code.replace(
  /activeDoctors:\s*12,\n\s*totalDoctors:\s*18,\n\s*\},/g,
  "activeDoctors: 12,\n    totalDoctors: 18,\n    specialistsByDepartment: { 'Pediatrics': 3, 'General Medicine': 5, 'Gynecology': 4 }\n  },"
);

fs.writeFileSync('server.ts', code);
console.log('Hospitals patched.');
