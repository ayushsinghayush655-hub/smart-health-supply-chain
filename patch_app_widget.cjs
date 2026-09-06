const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Import it
if (!code.includes('HelpChatWidget')) {
  code = code.replace(
    /import \{ OfflineSyncManager \} from '\.\/utils\/offlineSync';/,
    "import { OfflineSyncManager } from './utils/offlineSync';\nimport { HelpChatWidget } from './components/common/HelpChatWidget';"
  );
}

// 2. Add it before the final </div> in the return statement
code = code.replace(
  /\{\/\* Med-PaLM Multi-Agency AI Reasoning Modal \*\/\}/,
  "{/* Help & Gemini Chat Widget */}\n      <HelpChatWidget />\n\n      {/* Med-PaLM Multi-Agency AI Reasoning Modal */}"
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched with HelpChatWidget');
