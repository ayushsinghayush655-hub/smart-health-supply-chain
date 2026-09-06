const fs = require('fs');
const file = 'src/components/phc/PHCDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add state for AI Demand List
code = code.replace(
  "const [barcodeInput, setBarcodeInput] = useState<string>('');",
  "const [barcodeInput, setBarcodeInput] = useState<string>('');\n  const [showDemandList, setShowDemandList] = useState(false);\n  const [demandApproved, setDemandApproved] = useState(false);"
);

// Add AI Demand Generation logic in the transfer tab
const transferTabReplacement = `          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-400" />
                  Stock Resupply Orders
                </h3>
                <p className="text-xs text-slate-400">
                  Track incoming AI-directed transfers and procurements.
                </p>
              </div>
              <button 
                onClick={() => setShowDemandList(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4" /> Generate AI Normal Demand List
              </button>
            </div>

            {showDemandList && (
               <div className="bg-slate-950 p-4 border border-purple-500/30 rounded-xl mb-4 shadow-lg shadow-purple-900/10">
                 <h4 className="font-bold text-purple-300 text-sm mb-3">Predicted Restock Demand (Below Critical Buffer)</h4>
                 <div className="space-y-2">
                   {stocks.filter(s => s.availableStock <= s.criticalThreshold).map(s => (
                     <div key={s.id} className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800 text-xs text-slate-300">
                       <span>{s.medicineName}</span>
                       <span className="font-bold text-amber-400">Demand: {Math.max(10, s.criticalThreshold * 2 - s.availableStock)} {s.unit}</span>
                     </div>
                   ))}
                   {stocks.filter(s => s.availableStock <= s.criticalThreshold).length === 0 && (
                     <div className="text-xs text-slate-500 italic">No critical shortages currently detected. Buffer is healthy.</div>
                   )}
                 </div>
                 <div className="mt-4 flex justify-end">
                   <button 
                     onClick={() => { setDemandApproved(true); setShowDemandList(false); }}
                     className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg"
                   >
                     Approve Demand List
                   </button>
                 </div>
               </div>
            )}

            {demandApproved && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg text-emerald-400 text-xs mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Demand List approved and sent to District Medical Officer.
              </div>
            )}`;

code = code.replace(
  /<div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">\s*<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">\s*<div>\s*<h3 className="text-base font-bold text-white flex items-center gap-2">\s*<Truck className="w-5 h-5 text-purple-400" \/>\s*Incoming & Outgoing Stock Transfers\s*<\/h3>\s*<p className="text-xs text-slate-400">\s*Track incoming AI-directed transfers and outgoing emergency procurements\.\s*<\/p>\s*<\/div>\s*<\/div>/,
  transferTabReplacement
);

fs.writeFileSync(file, code);
console.log('Patched');
