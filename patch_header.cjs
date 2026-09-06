const fs = require('fs');
let code = fs.readFileSync('src/components/common/Header.tsx', 'utf8');

code = code.replace(
  /<div className="px-3 py-1\.5 border-b border-slate-700 text-\[11px\] text-slate-400 font-semibold uppercase">[\s\S]*?<div className="border-t border-slate-700 my-1"><\/div>/,
  ''
);

fs.writeFileSync('src/components/common/Header.tsx', code);
console.log('Header patched');
