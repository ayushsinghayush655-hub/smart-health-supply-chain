const fs = require('fs');

// 1. Remove line-clamp-2 from DMODashboard
let dmoDashboard = fs.readFileSync('src/components/dmo/DMODashboard.tsx', 'utf8');
dmoDashboard = dmoDashboard.replace(/line-clamp-2/g, '');
fs.writeFileSync('src/components/dmo/DMODashboard.tsx', dmoDashboard);
console.log('DMODashboard patched');

// 2. Remove UCP Emergency Orders from Map
let districtMap = fs.readFileSync('src/components/dmo/DistrictDynamicMap.tsx', 'utf8');
districtMap = districtMap.replace(
  /<button\s+onClick=\{\(\) => setActiveLayer\('ucp'\)\}\s+className=\{`px-3 py-1 rounded-lg transition \$\{activeLayer === 'ucp' \? 'bg-purple-600 text-white' : 'text-slate-400'\}`\}\s+>\s+UCP Emergency Orders\s+<\/button>/,
  ''
);

// We should also remove the rendering of UCP orders:
districtMap = districtMap.replace(
  /\{\(activeLayer === 'all' \|\| activeLayer === 'ucp'\) && transfers\.map\(t => \{[\s\S]*?\}\)\}\s+<\/MapContainer>/,
  '</MapContainer>'
);

// And the import of transfer orders if we need to but it's fine to leave it.
fs.writeFileSync('src/components/dmo/DistrictDynamicMap.tsx', districtMap);
console.log('DistrictDynamicMap patched');
