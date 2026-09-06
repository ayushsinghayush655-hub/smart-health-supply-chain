const fs = require('fs');

function replaceFile(path) {
  if (fs.existsSync(path)) {
    let code = fs.readFileSync(path, 'utf8');
    code = code.replace(/oxygenBeds/g, 'ventilators');
    code = code.replace(/oxygenOccupied/g, 'ventilatorsOccupied');
    code = code.replace(/Oxygen Beds/g, 'Ventilators');
    code = code.replace(/oxygen beds/g, 'ventilators');
    fs.writeFileSync(path, code);
    console.log('Patched', path);
  }
}

replaceFile('src/types/index.ts');
replaceFile('src/components/dmo/DMODashboard.tsx');
replaceFile('server.ts');

console.log('Oxygen Beds replaced with Ventilators');
