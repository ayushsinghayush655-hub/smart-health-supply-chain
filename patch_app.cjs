const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const \[userSession, setUserSession\] = useState<UserSession \| null>\(\(\) => \{[\s\S]*?\}\);/,
  `const [userSession, setUserSession] = useState<UserSession | null>(null);`
);

code = code.replace(
  /const \[isLoggedOut, setIsLoggedOut\] = useState<boolean>\(false\);/,
  `const [isLoggedOut, setIsLoggedOut] = useState<boolean>(true);`
);

fs.writeFileSync('src/App.tsx', code);
console.log('App patched');
