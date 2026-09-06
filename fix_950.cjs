const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      if (fs.statSync(dirFile).isDirectory()) {
        filelist = walkSync(dirFile, filelist);
      } else {
        if (dirFile.endsWith('.tsx')) {
          filelist.push(dirFile);
        }
      }
    } catch (err) {}
  });
  return filelist;
}

const files = walkSync('src');

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  
  // Header fix
  code = code.replace(/bg-indigo-950\/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-700\/50/g, 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200');
  
  // bg-color-950 -> bg-color-50
  code = code.replace(/bg-([a-z]+)-950\/[0-9]+/g, 'bg-$1-50');
  code = code.replace(/bg-([a-z]+)-950/g, 'bg-$1-50');
  
  // border-color-800 or 700 -> border-color-200 or 300
  code = code.replace(/border-([a-z]+)-800\/[0-9]+/g, 'border-$1-200');
  code = code.replace(/border-([a-z]+)-800/g, 'border-$1-200');
  code = code.replace(/border-([a-z]+)-700\/[0-9]+/g, 'border-$1-200');
  code = code.replace(/border-([a-z]+)-700/g, 'border-$1-200');

  // text-color-200, 300, 400 -> text-color-700, 800, 900
  code = code.replace(/text-([a-z]+)-200/g, 'text-$1-800');
  code = code.replace(/text-([a-z]+)-300/g, 'text-$1-700');
  code = code.replace(/text-([a-z]+)-400/g, 'text-$1-600');
  
  // Specific fix for MedPalm modal header
  code = code.replace(/from-slate-900 via-indigo-950 to-slate-900/g, 'from-white via-indigo-50 to-white');
  // Specific fix for DMO Dashboard header
  code = code.replace(/from-slate-900 via-slate-850 to-slate-900/g, 'bg-white');

  fs.writeFileSync(file, code);
});
console.log('Fixed 950 colors');
