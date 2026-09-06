const fs = require('fs');

let code = fs.readFileSync('src/components/dmo/DMODashboard.tsx', 'utf8');

const tab3 = `        <button
          onClick={() => setActiveTab('transfers_ucp')}
          className={\`px-4 py-2.5 rounded-lg flex items-center gap-2 transition whitespace-nowrap \${
            activeTab === 'transfers_ucp'
              ? 'bg-amber-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/60'
          }\`}
        >
          <Truck className="w-4 h-4" />
          <span>4. AI Stock Resupply & UCP Procurement Hub ({stockTransfers.length})</span>
        </button>`;

const tab4 = `        <button
          onClick={() => setActiveTab('hospitals_beds')}
          className={\`px-4 py-2.5 rounded-lg flex items-center gap-2 transition whitespace-nowrap \${
            activeTab === 'hospitals_beds'
              ? 'bg-amber-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/60'
          }\`}
        >
          <Building2 className="w-4 h-4" />
          <span>3. Govt Hospitals & Specialist Duty Roster ({hospitals.length})</span>
        </button>`;

code = code.replace(tab3 + '\n\n' + tab4, tab4 + '\n\n' + tab3);

fs.writeFileSync('src/components/dmo/DMODashboard.tsx', code);
console.log('Tabs swapped');
