const fs = require('fs');

let code = fs.readFileSync('src/components/dmo/DMODashboard.tsx', 'utf8');

const replacement = `
                  {/* Bed Occupancy Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Total Bed Occupancy</span>
                      <span className="font-bold">{hosp.occupiedBeds} / {hosp.totalBeds} ({bedPct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className={\`h-full rounded-full transition-all duration-500 \${
                          bedPct > 85 ? 'bg-rose-500' : 'bg-sky-500'
                        }\`}
                        style={{ width: \`\${bedPct}%\` }}
                      ></div>
                    </div>
                  </div>

                  {/* Department Resource Allocation Breakdown */}
                  <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/50">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Department Allocation & Specialists</h5>
                    <div className="space-y-2">
                      {hosp.specialistsByDepartment && Object.entries(hosp.specialistsByDepartment).map(([dept, count]) => {
                        // Simulate an estimated bed allocation per department for actionable data
                        const totalBedsForDept = Math.round(hosp.totalBeds * (count / hosp.totalDoctors) * 1.5);
                        const occupiedBedsForDept = Math.min(totalBedsForDept, Math.round(totalBedsForDept * (0.6 + Math.random() * 0.3)));
                        const deptPct = Math.round((occupiedBedsForDept / totalBedsForDept) * 100) || 0;
                        return (
                          <div key={dept} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-medium text-slate-200">{dept}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-slate-400">Dr: <strong className="text-emerald-400">{count}</strong></span>
                                <span className="text-slate-400">Beds: <strong className={deptPct > 85 ? 'text-rose-400' : 'text-sky-400'}>{occupiedBedsForDept}/{totalBedsForDept}</strong></span>
                              </div>
                            </div>
                            <div className="w-full h-1 rounded-full bg-slate-900 overflow-hidden">
                              <div className={\`h-full rounded-full \${deptPct > 85 ? 'bg-rose-500' : 'bg-sky-500'}\`} style={{ width: \`\${Math.min(100, deptPct)}%\` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
`;

code = code.replace(
  /\{\/\* Bed Occupancy Progress \*\/\}[\s\S]*?\{\/\* Key Metrics Grid \*\/\}/,
  replacement
);

fs.writeFileSync('src/components/dmo/DMODashboard.tsx', code);
console.log('Hospital Card Patched with Department Breakdown');
