const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Replace duplicate ventilatorsOccupied and also remove ventilatorsTotal
// so that only ventilators and ventilatorsOccupied remain.
content = content.replace(/\s*ventilatorsTotal: \d+,\n\s*ventilatorsOccupied: \d+,/g, '');

fs.writeFileSync('server.ts', content);
console.log('Duplicates fixed');
