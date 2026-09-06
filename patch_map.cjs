const fs = require('fs');
let code = fs.readFileSync('src/components/dmo/DistrictDynamicMap.tsx', 'utf8');

// import Tooltip
code = code.replace(
  /import \{ MapContainer, TileLayer, CircleMarker, Popup, Circle, Polygon, Polyline \} from 'react-leaflet';/,
  "import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, Circle, Polygon, Polyline } from 'react-leaflet';"
);

// replace tooltips for hospitals
code = code.replace(
  /<Popup className="text-slate-900">\s*<div className="font-bold text-sm">\{hosp\.name\}<\/div>\s*<div className="text-xs">Beds: \{hosp\.occupiedBeds\}\/\{hosp\.totalBeds\}<\/div>\s*<\/Popup>/g,
  `<Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="font-bold text-sm text-slate-800">{hosp.name}</div>
                <div className="text-xs text-slate-600">Beds: {hosp.occupiedBeds}/{hosp.totalBeds}</div>
                {hosp.specialistsByDepartment && (
                  <div className="text-[10px] text-slate-500 mt-1 border-t pt-1">
                    {Object.entries(hosp.specialistsByDepartment).map(([d, c]) => \`\${d}(\${c})\`).join(', ')}
                  </div>
                )}
              </Tooltip>`
);

// replace tooltips for PHCs
code = code.replace(
  /<Popup className="text-slate-900">\s*<div className="font-bold text-sm">\{phc\.name\}<\/div>\s*<div className="text-xs text-rose-600">Critical Shortages!<\/div>\s*<\/Popup>/g,
  `<Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="font-bold text-sm text-slate-800">{phc.name}</div>
                <div className="text-xs text-rose-600 font-bold">Critical Shortages Active</div>
              </Tooltip>`
);

// replace tooltips for Threats (Circles)
code = code.replace(
  /<Popup className="text-slate-900">\s*<div className="font-bold text-sm">\{threat\.type\} Alert<\/div>\s*<div className="text-xs">\{threat\.description\}<\/div>\s*<\/Popup>/g,
  `<Tooltip direction="top" offset={[0, -10]} opacity={1} className="w-48">
                <div className="font-bold text-sm text-slate-800">{threat.type} Alert ({threat.severity})</div>
                <div className="text-xs text-slate-600 font-medium">Source: {threat.source}</div>
                <div className="text-xs text-slate-600 mt-1">{threat.description}</div>
              </Tooltip>`
);

fs.writeFileSync('src/components/dmo/DistrictDynamicMap.tsx', code);
console.log('Map Patched');
