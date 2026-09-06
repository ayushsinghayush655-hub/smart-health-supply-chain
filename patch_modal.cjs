const fs = require('fs');
let code = fs.readFileSync('src/components/common/AttendanceModal.tsx', 'utf8');

code = code.replace(
  /\/\/ Fallback photo generator for offline\/iframe testing[\s\S]*?const handleSubmitAttendance/,
  'const handleSubmitAttendance'
);

fs.writeFileSync('src/components/common/AttendanceModal.tsx', code);
console.log('Fixed syntax error');
