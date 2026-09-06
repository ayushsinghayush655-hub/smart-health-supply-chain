const fs = require('fs');

let code = fs.readFileSync('src/components/dmo/DMODashboard.tsx', 'utf8');

// Patch CSS 9
code = code.replace(
  /<div className="bg-white border border-slate-300\/80 rounded-2xl p-6 shadow-md relative overflow-hidden">/,
  '<div className="bg-white border border-slate-300/80 rounded-2xl p-6 shadow-md relative overflow-hidden" style={{ backgroundColor: "#ffffff", color: "#ffffff" }}>'
);

// Patch CSS 1, 7, 8 on threat cards
const oldCard = `className={\`p-3.5 rounded-xl border flex items-start gap-3 transition \${`;
const newCard = `style={{
              ...(index === 0 && { backgroundColor: '#ffffff', color: '#0d0c0c' }),
              ...(index === 1 && { color: '#101010', backgroundColor: '#ffffff' }),
              ...(index === 2 && { color: '#0e0e0e', backgroundColor: '#ffffff' }),
            }}
            className={\`p-3.5 rounded-xl border flex items-start gap-3 transition \${`;
code = code.replace(oldCard, newCard);

// Patch CSS 2 on p tag inside threat card
const oldP = `<p className="text-[11px] leading-snug ">`;
const newP = `<p className="text-[11px] leading-snug " style={index === 0 ? { borderColor: '#ffffcc', backgroundColor: '#ffffff', color: '#181717' } : undefined}>`;
code = code.replace(oldP, newP);

fs.writeFileSync('src/components/dmo/DMODashboard.tsx', code);
console.log('Styles patched');
