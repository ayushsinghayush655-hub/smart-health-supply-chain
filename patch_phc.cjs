const fs = require('fs');
let code = fs.readFileSync('src/components/phc/PHCDashboard.tsx', 'utf8');

// Remove the Tab 2 button
code = code.replace(
  /<button\s+onClick=\{\(\) => setActiveTab\('ledger_records'\)\}[\s\S]*?<\/button>/,
  ''
);

// Fix Tab numbering
code = code.replace(
  /<span>3\. Complete Stock Catalog \(Available & Sold\)<\/span>/,
  '<span>2. Complete Stock Catalog (Available & Sold)</span>'
);

// Remove the ledger_records body
code = code.replace(
  /\{\/\* TAB 2: EXTRACTED CENTRAL RECORDS \*\/\}\s*\{activeTab === 'ledger_records' && \([\s\S]*?\}\s*\)\}/,
  ''
);

fs.writeFileSync('src/components/phc/PHCDashboard.tsx', code);
console.log('PHCDashboard patched to remove extracted central records tab');
