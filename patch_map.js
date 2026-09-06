const fs = require('fs');
let code = fs.readFileSync('src/components/dmo/DistrictDynamicMap.tsx', 'utf8');

const legendHTML = `
      {/* Map Legend overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 border border-slate-700 p-3 rounded-xl shadow-lg backdrop-blur-sm pointer-events-none">
        <h4 className="text-xs font-bold text-slate-200 mb-2 uppercase tracking-wide">Map Legend</h4>
        <div className="space-y-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500 border border-indigo-400"></div>
            <span>Govt Hospital</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sky-400 border border-sky-300"></div>
            <span>Primary Health Centre (PHC)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-rose-400/50 border border-rose-500"></div>
            <span>CWC River Flood Risk Zone (Red)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400/50 border border-amber-500"></div>
            <span>Aedes Index Alert / Dengue (Orange)</span>
          </div>
        </div>
      </div>
      
      <div className="w-full h-[500px] z-0">
`;

code = code.replace(/<div className="w-full h-\[500px\] z-0">/, legendHTML);

fs.writeFileSync('src/components/dmo/DistrictDynamicMap.tsx', code);
console.log('Map patched to include legend');
