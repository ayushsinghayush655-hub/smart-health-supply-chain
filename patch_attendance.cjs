const fs = require('fs');
let code = fs.readFileSync('src/components/common/AttendanceModal.tsx', 'utf8');

// Add geofencing restriction to submission
code = code.replace(
  /const handleSubmitAttendance = async \(\) => \{\n    if \(\!photoData\) \{/,
  `const handleSubmitAttendance = async () => {
    const isUrban = areaType === 'urban';
    const isGeofenceOk = distanceMeters !== null ? distanceMeters <= 500 : true;
    if (isUrban && !isGeofenceOk) {
      setStatusMessage({ type: 'error', text: 'Geofencing failed: You must be within 500m of the facility to log attendance.' });
      return;
    }
    if (!photoData) {`
);

// Remove file upload logic
code = code.replace(
  /const handleFileUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?\};\n/,
  ''
);

// Remove Quick Verified Selfie function
code = code.replace(
  /const generateSimulatedSelfie = \(\) => \{[\s\S]*?stopCamera\(\);\n  \};\n/,
  ''
);

// Remove Upload Photo and Quick Verified Selfie buttons from render
code = code.replace(
  /<label className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer transition">[\s\S]*?<\/label>/,
  ''
);

code = code.replace(
  /<button\n                  id="btn-simulated-selfie"[\s\S]*?<\/button>/,
  ''
);

fs.writeFileSync('src/components/common/AttendanceModal.tsx', code);
console.log('AttendanceModal patched');
