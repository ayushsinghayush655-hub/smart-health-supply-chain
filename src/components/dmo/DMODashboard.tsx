import React, { useState, useEffect } from 'react';
import { UserSession, PHCRecord, HospitalRecord, MedicineStockItem, StockTransferOrder, OutbreakThreat } from '../../types';
import { DistrictDynamicMap } from './DistrictDynamicMap';
import {
  Shield,
  Building2,
  Stethoscope,
  Package,
  AlertTriangle,
  ArrowRightLeft,
  Truck,
  CheckCircle2,
  Clock,
  Bed,
  Search,
  Filter,
  Layers,
  Sparkles,
  Waves,
  CloudRain,
  Activity,
  FileCheck2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface DMODashboardProps {
  userSession: UserSession;
  onOpenMedPalm: () => void;
}

export const DMODashboard: React.FC<DMODashboardProps> = ({
  userSession,
  onOpenMedPalm,
}) => {
  const [summaryData, setSummaryData] = useState<{
    phcs: PHCRecord[];
    hospitals: HospitalRecord[];
    medicineStocks: MedicineStockItem[];
    stockTransfers: StockTransferOrder[];
    outbreakThreats: OutbreakThreat[];
    ledgerEntries: any[];
    metrics: any;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPHCFilter, setSelectedPHCFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [medicineSearchQuery, setMedicineSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'map_overview' | 'stock_matrix' | 'transfers_ucp' | 'hospitals_beds' | 'ledger_data'>('map_overview');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchDMOSummary();
  }, []);

  const fetchDMOSummary = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dmo/summary');
      if (res.ok) {
        const data = await res.json();
        setSummaryData(data);
      }
    } catch (e) {
      console.error('Failed to load DMO data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveTransfer = async (transferId: string) => {
    try {
      const res = await fetch('/api/dmo/approve-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferId, action: 'APPROVE' }),
      });
      if (res.ok) {
        setActionNotice(`Order #${transferId} authorized and dispatched under National Health Mission emergency mandate.`);
        setTimeout(() => setActionNotice(null), 4000);
        fetchDMOSummary();
      }
    } catch (e) {
      console.error('Approve failed:', e);
    }
  };

  if (isLoading || !summaryData) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-medium">Loading District Command Intelligence...</span>
        </div>
      </div>
    );
  }

  const { phcs, hospitals, medicineStocks, stockTransfers, outbreakThreats, ledgerEntries, metrics } = summaryData;

  // Filtered Stock Matrix
  const filteredStocks = medicineStocks.filter((item) => {
    const matchesPHC = selectedPHCFilter === 'ALL' || item.phcId === selectedPHCFilter;
    const matchesCategory = selectedCategoryFilter === 'ALL' || item.category === selectedCategoryFilter;
    const matchesSearch =
      item.medicineName.toLowerCase().includes(medicineSearchQuery.toLowerCase()) ||
      item.genericName.toLowerCase().includes(medicineSearchQuery.toLowerCase());
    return matchesPHC && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Official Government of India Header Banner */}
      <div className="bg-gradient-to-r bg-white border border-slate-300/80 rounded-2xl p-6 shadow-md relative overflow-hidden">
        {/* Subtle Ashoka Emblem Watermark Accent */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none text-slate-900">
          <Shield className="w-64 h-64" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-600 px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                GOVERNMENT OF INDIA • STATE HEALTH SECRETARIAT
              </span>
              <span className="text-xs text-slate-600 font-mono">
                CODE: DMO-HQ-UP-24
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Office of the District Medical Officer (DMO)
            </h2>
            <p className="text-xs text-slate-700 max-w-3xl leading-relaxed">
              Unified surveillance portal for Kanpur District. Centralized inventory monitoring of all Primary Health Centres, real-time hospital bed allocations, multi-agency threat correlation, and automated stock redistribution.
            </p>
          </div>

          {/* Quick AI Synthesizer Action */}
          <button
            onClick={onOpenMedPalm}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-slate-900 font-bold text-xs shadow-lg flex items-center gap-2 shrink-0 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>Launch Gemini Threat Matrix</span>
          </button>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}
      </div>

      {/* Multi-Agency Alert Bar (CWC, IMD, NDMA, Epidemiology) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {outbreakThreats.map((threat, index) => (
          <div
            key={threat.id}
            style={{
              ...(index === 0 && { backgroundColor: '#ffffff', color: '#0d0c0c' }),
              ...(index === 1 && { color: '#101010', backgroundColor: '#ffffff' }),
              ...(index === 2 && { color: '#0e0e0e', backgroundColor: '#ffffff' }),
            }}
            className={`p-3.5 rounded-xl border flex items-start gap-3 transition ${
              threat.severity === 'CRITICAL'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : threat.severity === 'HIGH'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="mt-0.5">
              {threat.threatType === 'FLOOD' ? (
                <Waves className="w-4 h-4 text-rose-600" />
              ) : threat.threatType === 'HEAVY_RAINFALL' ? (
                <CloudRain className="w-4 h-4 text-amber-600" />
              ) : (
                <Activity className="w-4 h-4 text-purple-600" />
              )}
            </div>
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold uppercase tracking-wider text-[10px]">
                  {threat.sourceAgency}
                </span>
                <span className="text-[9px] font-mono opacity-75">
                  {threat.severity}
                </span>
              </div>
              <p className="text-[11px] leading-snug " style={index === 0 ? { borderColor: '#ffffcc', backgroundColor: '#ffffff', color: '#181717' } : undefined}>
                {threat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Core District Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
          <div className="text-xs text-slate-600 flex items-center justify-between">
            <span>Primary Health Centres</span>
            <Stethoscope className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {metrics.totalPHCs}
          </div>
          <div className="text-[11px] text-slate-600 mt-0.5">
            {metrics.ruralPHCs} Rural • {metrics.urbanPHCs} Urban
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
          <div className="text-xs text-slate-600 flex items-center justify-between">
            <span>Critical Drug Shortages</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            {metrics.criticalShortages} Alerts
          </div>
          <div className="text-[11px] text-slate-600 mt-0.5 ">
            {medicineStocks.filter((s) => s.availableStock <= s.criticalThreshold)
              .map(s => {
                const phcName = phcs.find(p => p.id === s.phcId)?.name || 'Facility';
                return `${s.medicineName} at ${phcName}`;
              }).join(', ') || 'No critical shortages'}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
          <div className="text-xs text-slate-600 flex items-center justify-between">
            <span>Hospital Bed Occupancy</span>
            <Bed className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {metrics.occupiedBeds} / {metrics.totalBeds}
          </div>
          <div className="text-[11px] text-slate-600 mt-0.5 ">
            {hospitals.map(h => `${h.name}: ${h.occupiedBeds}/${h.totalBeds}`).join(' • ')}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
          <div className="text-xs text-slate-600 flex items-center justify-between">
            <span>Pending Reallocations</span>
            <ArrowRightLeft className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {metrics.pendingTransfers} Orders
          </div>
          <div className="text-[11px] text-slate-600 mt-0.5">
            AI-directed stock re-supplies
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 text-xs font-medium space-x-1 sm:space-x-3 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('map_overview')}
          className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'map_overview'
              ? 'bg-amber-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Dynamic District Map & Epidemic Overlays</span>
        </button>

        <button
          onClick={() => setActiveTab('stock_matrix')}
          className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'stock_matrix'
              ? 'bg-amber-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>2. Complete PHC Medicine Stock Report ({medicineStocks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hospitals_beds')}
          className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'hospitals_beds'
              ? 'bg-amber-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>3. Govt Hospitals & Specialist Duty Roster ({hospitals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transfers_ucp')}
          className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'transfers_ucp'
              ? 'bg-amber-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>4. AI Stock Resupply & UCP Procurement Hub ({stockTransfers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger_data')}
          className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'ledger_data'
              ? 'bg-amber-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>5. Uploaded Facility Ledgers</span>
        </button>
      </div>

      {/* TAB 1: DYNAMIC DISTRICT MAP */}
      {activeTab === 'map_overview' && (
        <div className="space-y-4">
          <DistrictDynamicMap
            phcs={phcs}
            hospitals={hospitals}
            outbreakThreats={outbreakThreats}
            transfers={stockTransfers}
          />
        </div>
      )}

      {/* TAB 2: COMPLETE PHC STOCK MATRIX */}
      {activeTab === 'stock_matrix' && (
        <div className="space-y-4">
          {/* Filtering Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={medicineSearchQuery}
                  onChange={(e) => setMedicineSearchQuery(e.target.value)}
                  placeholder="Search medicine by name..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* PHC Filter Dropdown */}
              <select
                value={selectedPHCFilter}
                onChange={(e) => setSelectedPHCFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Primary Health Centres</option>
                {phcs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.areaType})
                  </option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Therapeutic Categories</option>
                <option value="Antibiotic">Antibiotics</option>
                <option value="Fluid/Electrolyte">Fluids & Electrolytes</option>
                <option value="Analgesic">Analgesics & Anti-pyretics</option>
                <option value="Emergency">Emergency / Antidotes</option>
                <option value="Antidiabetic">Chronic / Antidiabetic</option>
              </select>
            </div>

            <div className="text-xs text-slate-600 font-mono">
              Showing {filteredStocks.length} facility stock records
            </div>
          </div>

          {/* Master Table */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-white text-slate-600 text-[11px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">PHC Facility</th>
                    <th className="p-3">Medicine IP</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Available Stock</th>
                    <th className="p-3">Sold Qty</th>
                    <th className="p-3">Delivered</th>
                    <th className="p-3">Safety Buffer</th>
                    <th className="p-3">Batch & Expiry</th>
                    <th className="p-3">Supply Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredStocks.map((item) => {
                    const phc = phcs.find((p) => p.id === item.phcId);
                    const isCritical = item.availableStock <= item.criticalThreshold;

                    return (
                      <tr key={item.id} className="hover:bg-slate-100/40">
                        <td className="p-3">
                          <div className="font-semibold text-slate-900">{phc?.name}</div>
                          <div className="text-[10px] text-slate-600 capitalize">{phc?.areaType} • Store {phc?.storeId}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-slate-900">{item.medicineName}</div>
                          <div className="text-[10px] text-slate-600">{item.genericName}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3 font-bold">
                          <span className={isCritical ? 'text-rose-600' : 'text-emerald-600'}>
                            {item.availableStock} {item.unit}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700">{item.soldStock}</td>
                        <td className="p-3 text-sky-600">{item.deliveredStock}</td>
                        <td className="p-3 font-mono text-slate-600">{item.criticalThreshold}</td>
                        <td className="p-3 text-[11px] font-mono text-slate-600">
                          <div>{item.batchNumber}</div>
                          <div className="text-[10px] text-slate-500">Exp: {item.expiryDate}</div>
                        </td>
                        <td className="p-3">
                          {isCritical ? (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-600 border border-rose-500/40 flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3" /> CRITICAL DEFICIT
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" /> ADEQUATE
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AI RESUPPLY & UCP PROCUREMENT HUB */}
      {activeTab === 'transfers_ucp' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  AI-Directed Inter-PHC Stock Transfers & UCP Central Requisitions
                </h3>
                <p className="text-xs text-slate-600">
                  Review and authorize dynamic reallocation orders generated by Gemini based on epidemic surges, and central UCP emergency requests from facilities.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {stockTransfers.map((trf) => (
                <div
                  key={trf.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        trf.type === 'AI_REDISTRIBUTION'
                          ? 'bg-purple-500/10 text-purple-700 border-purple-500/30'
                          : 'bg-rose-500/10 text-rose-700 border-rose-500/30'
                      }`}>
                        {trf.type === 'AI_REDISTRIBUTION' ? 'Inter-PHC Redistribution' : 'UCP Emergency Procurement'}
                      </span>
                      <span className="text-xs font-mono text-slate-600">Ref: {trf.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        trf.urgency === 'EMERGENCY'
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-amber-500/20 text-amber-700'
                      }`}>
                        {trf.urgency} PRIORITY
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-bold text-base text-slate-900">
                        {trf.medicineName}
                        <span className="text-amber-600 ml-2 bg-amber-500/10 px-2 py-0.5 rounded text-sm">{trf.quantity} {trf.unit} required</span>
                      </h4>
                    </div>

                    <div className="text-xs text-slate-700 flex items-center gap-2 flex-wrap bg-slate-50 px-3 py-2 rounded-lg">
                      <span className="text-slate-600">{trf.type === 'UCP_PROCUREMENT' ? 'Central Warehouse:' : 'Source PHC:'}</span> 
                      <strong className="text-sky-700">{trf.fromFacilityName}</strong>
                      <span className="text-slate-500">➔</span>
                      <span className="text-slate-600">Receiving Facility:</span> 
                      <strong className="text-emerald-700">{trf.toFacilityName}</strong>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50/60 p-2.5 rounded-lg border border-slate-200/80 mt-2">
                      <strong className="text-slate-700">Justification:</strong> {trf.reason}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 pt-3 lg:pt-0 lg:pl-4">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg w-full text-center ${
                      trf.status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30'
                        : trf.status === 'DISPATCHED'
                        ? 'bg-sky-500/20 text-sky-700 border border-sky-500/30'
                        : 'bg-amber-500/20 text-amber-700 border border-amber-500/30'
                    }`}>
                      Status: {trf.status.replace('_', ' ')}
                    </span>

                    {trf.status === 'PENDING_APPROVAL' && (
                      <button
                        onClick={() => handleApproveTransfer(trf.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Authorize & Dispatch</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GOVT HOSPITALS & SPECIALIST DUTY */}
      {activeTab === 'hospitals_beds' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hospitals.map((hosp) => {
              const bedPct = Math.round((hosp.occupiedBeds / hosp.totalBeds) * 100);

              return (
                <div key={hosp.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {hosp.type}
                      </span>
                      <h4 className="font-bold text-base text-slate-900 mt-1">{hosp.name}</h4>
                    </div>
                  </div>

                  
                  {/* Bed Occupancy Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>Total Bed Occupancy</span>
                      <span className="font-bold">{hosp.occupiedBeds} / {hosp.totalBeds} ({bedPct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          bedPct > 85 ? 'bg-rose-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${bedPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Department Resource Allocation Breakdown */}
                  <div className="bg-white/40 rounded-xl p-3 border border-slate-200/50">
                    <h5 className="text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-2">Department Allocation & Specialists</h5>
                    <div className="space-y-2">
                      {hosp.specialistsByDepartment && Object.entries(hosp.specialistsByDepartment).map(([dept, count]) => {
                        // Simulate an estimated bed allocation per department for actionable data
                        const totalBedsForDept = Math.round(hosp.totalBeds * (count / hosp.totalDoctors) * 1.5);
                        const occupiedBedsForDept = Math.min(totalBedsForDept, Math.round(totalBedsForDept * (0.6 + Math.random() * 0.3)));
                        const deptPct = Math.round((occupiedBedsForDept / totalBedsForDept) * 100) || 0;
                        return (
                          <div key={dept} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-medium text-slate-800">{dept}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-slate-600">Dr: <strong className="text-emerald-600">{count}</strong></span>
                                <span className="text-slate-600">Beds: <strong className={deptPct > 85 ? 'text-rose-600' : 'text-sky-600'}>{occupiedBedsForDept}/{totalBedsForDept}</strong></span>
                              </div>
                            </div>
                            <div className="w-full h-1 rounded-full bg-slate-50 overflow-hidden">
                              <div className={`h-full rounded-full ${deptPct > 85 ? 'bg-rose-500' : 'bg-sky-500'}`} style={{ width: `${Math.min(100, deptPct)}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Key Metrics Grid */}

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-white/60 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-600">ICU Beds</div>
                      <div className="text-sm font-bold text-rose-600 mt-0.5">
                        {hosp.icuOccupied} / {hosp.icuBeds}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white/60 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-600">Ventilators</div>
                      <div className="text-sm font-bold text-sky-600 mt-0.5">
                        {hosp.ventilatorsOccupied} / {hosp.ventilators}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white/60 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-600">Specialist Rate</div>
                      <div className="text-sm font-bold text-emerald-600 mt-0.5">
                        {hosp.specialistRate}%
                      </div>
                    </div>

                    <div className="p-2.5 bg-white/60 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-600">Emergency Response</div>
                      <div className="text-sm font-bold text-amber-600 mt-0.5">
                        {hosp.emergencyResponseMinutes} min
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <span>Active Specialists on Duty:</span>
                      <strong className="text-slate-800">{hosp.activeDoctors} of {hosp.totalDoctors}</strong>
                    </div>
                    {hosp.specialistsByDepartment && (
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(hosp.specialistsByDepartment).map(([dept, count]) => (
                          <span key={dept} className="px-2 py-0.5 bg-slate-100/80 rounded-md text-[10px] text-slate-700">
                            {dept}: <strong className="text-slate-900">{count}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: LEDGER DATA */}
      {activeTab === 'ledger_data' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              Uploaded Facility Ledgers
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100/40 text-slate-600 text-xs uppercase tracking-wider">
                    <th className="p-3 font-medium rounded-tl-lg">Facility / ID</th>
                    <th className="p-3 font-medium">Method</th>
                    <th className="p-3 font-medium">Medicine Name</th>
                    <th className="p-3 font-medium">Batch</th>
                    <th className="p-3 font-medium">Qty Sold</th>
                    <th className="p-3 font-medium">Timestamp</th>
                    <th className="p-3 font-medium rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {ledgerEntries && ledgerEntries.length > 0 ? (
                    ledgerEntries.map((entry: any) => {
                      const phc = phcs.find((p) => p.id === entry.phcId);
                      return (
                        <tr key={entry.id} className="hover:bg-slate-100/40 text-sm">
                          <td className="p-3">
                            <div className="font-semibold text-slate-900">{phc?.name || entry.phcId}</div>
                            <div className="text-[10px] text-slate-600">Store: {entry.storeId}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700">
                              {entry.uploadMethod}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-900">{entry.medicineName}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-600">{entry.batchNumber}</td>
                          <td className="p-3 font-bold text-emerald-600">{entry.quantitySold}</td>
                          <td className="p-3 text-[11px] text-slate-600">{new Date(entry.timestamp).toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${entry.status === 'verified' ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/40' : 'bg-slate-100 text-slate-600'}`}>
                              {entry.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 text-sm">
                        No ledger entries uploaded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
