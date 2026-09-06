const fs = require('fs');
let code = fs.readFileSync('src/components/common/LoginModal.tsx', 'utf8');

const replacement = `
  const [errorMsg, setErrorMsg] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    const u = username.toLowerCase().trim();
    const p = password;
    
    if (p !== 'password123') {
      setErrorMsg('Invalid password. (Hint: password123)');
      return;
    }

    if (u === 'moic_phc01') {
      onLogin(roleProfiles['PHC_INCHARGE']);
    } else if (u === 'dmo_kanpur') {
      onLogin(roleProfiles['DMO']);
    } else if (u === 'supt_gsvm_hosp') {
      onLogin(roleProfiles['GOVT_HOSPITAL']);
    } else {
      setErrorMsg('Invalid Username. Use moic_phc01, dmo_kanpur, or supt_gsvm_hosp');
    }
  };
`;

code = code.replace(
  /const handleQuickLogin = [\s\S]*?const handleFormSubmit = \(e: React\.FormEvent\) => \{[\s\S]*?\};\n/,
  replacement
);

// Remove the Three Role Choice Cards
code = code.replace(
  /<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">[\s\S]*?<\/div>\s*\{\/\* Credentials Form \*\/\}/,
  '{/* Credentials Form */}'
);

// Remove the Profile Info Preview
code = code.replace(
  /\{\/\* Profile Info Preview \*\/\}\s*<div className="p-3 bg-slate-950\/80 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">[\s\S]*?<\/div>/,
  `{errorMsg && <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl">{errorMsg}</div>}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400">
              <p className="font-semibold text-slate-200 mb-1">Demo Credentials:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>PHC Incharge: <b>moic_phc01</b> / password123</li>
                <li>District Medical Officer: <b>dmo_kanpur</b> / password123</li>
                <li>Hospital Supt: <b>supt_gsvm_hosp</b> / password123</li>
              </ul>
            </div>`
);

// Fix the button text
code = code.replace(
  /<span>Log In to \{roleProfiles\[selectedRole\]\.role\.replace\('_', ' '\)\} Dashboard<\/span>/,
  '<span>Secure Login</span>'
);

fs.writeFileSync('src/components/common/LoginModal.tsx', code);
console.log('LoginModal patched');
