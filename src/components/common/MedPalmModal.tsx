import React, { useState } from 'react';
import { MedPalmAnalysisResult } from '../../types';
import {
  Sparkles,
  X,
  RefreshCw,
  Waves,
  CloudRain,
  ShieldAlert,
  Activity,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Package,
  FileText
} from 'lucide-react';

interface MedPalmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRecommendations?: (result: MedPalmAnalysisResult) => void;
}

export const MedPalmModal: React.FC<MedPalmModalProps> = ({
  isOpen,
  onClose,
  onApplyRecommendations,
}) => {
  const [analysis, setAnalysis] = useState<MedPalmAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(false);
  const [appliedNotice, setAppliedNotice] = useState<boolean>(false);

  const runMedPalmSynthesis = async () => {
    setIsLoading(true);
    setAppliedNotice(false);
    try {
      const response = await fetch('/api/gemini/epidemic-medpalm-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        setAnalysis(data.analysis);
        setHasRun(true);
      }
    } catch (e) {
      console.error('Med-PaLM trigger error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (analysis) {
      setAppliedNotice(true);
      onApplyRecommendations?.(analysis);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl text-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
                  AI CLINICAL & LOGISTICS ENGINE
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Gemini / Med-PaLM Synthesis
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Multi-Agency Threat Synthesis & Automated Medicine Allocation
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Integrated Data Stream Badges */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs font-semibold text-slate-300 mb-2">
              Cross-Disciplinary Input Sources Ingested:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <Waves className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">CWC River Feed</div>
                  <div className="text-[10px] text-slate-400">114.8m Warning Level</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">IMD Meteorology</div>
                  <div className="text-[10px] text-slate-400">62mm/hr Heavy Rain</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">Epidemiology Dept</div>
                  <div className="text-[10px] text-slate-400">Gastro & Dengue Clusters</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">PHC & Hospital Beds</div>
                  <div className="text-[10px] text-slate-400">Real-time Dispensing & Load</div>
                </div>
              </div>
            </div>
          </div>

          {!analysis && !isLoading && (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-white">
                  Execute Med-PaLM Unified Epidemiological Analysis
                </h3>
                <p className="text-xs text-slate-400">
                  Analyze current PHC ledger depletion rates, hospital ICU bed loads, and CWC/IMD environmental threats to identify required medicines and generate automatic UCP/warehouse transfer routes.
                </p>
              </div>
              <button
                id="btn-run-medpalm-modal"
                onClick={runMedPalmSynthesis}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-xl transition cursor-pointer"
              >
                Analyze Multi-Agency Feeds Now
              </button>
            </div>
          )}

          {isLoading && (
            <div className="py-16 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">
                  Correlating Multi-Agency Feeds with Med-PaLM...
                </p>
                <p className="text-xs text-slate-400">
                  Computing disease threat propagation index, calculating drug burn-down rates, and finding nearest surplus facilities.
                </p>
              </div>
            </div>
          )}

          {analysis && !isLoading && (
            <div className="space-y-6">
              {/* Threat Level & Summary Banner */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      THREAT SEVERITY: {analysis.threatAssessment.overallThreatLevel}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Timestamp: {new Date(analysis.generatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <button
                    onClick={runMedPalmSynthesis}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Re-evaluate Model
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {analysis.threatAssessment.summary}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-400">Primary Outbreak Risks:</span>
                  {analysis.threatAssessment.primaryDiseases.map((dis, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      {dis}
                    </span>
                  ))}
                </div>
              </div>

              {/* Medicine Requirements Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-sky-400" />
                  Med-PaLM Identified Critical Medicine Requirements
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysis.medicineRequirements.map((med, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{med.medicineName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          med.urgency === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {med.urgency}
                        </span>
                      </div>

                      <div className="text-xs text-sky-400 font-semibold">
                        Recommended Additional Quota: {med.recommendedQuantity} {med.unit}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-snug">
                        {med.clinicalRationale}
                      </p>

                      <div className="text-[10px] text-slate-500 font-mono pt-1">
                        Sourced via: {med.recommendedSource}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automated AI Logistics Actions (Transfers & UCP Orders) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  Proposed Dynamic Reallocations & Procurement Orders
                </h4>

                <div className="space-y-2">
                  {analysis.logisticsActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                            {action.type}
                          </span>
                          <span className="font-bold text-white">
                            {action.medicineName} ({action.quantity} {action.unit})
                          </span>
                        </div>
                        <div className="text-slate-400 flex items-center gap-1.5">
                          <span>Origin: <strong>{action.fromFacilityName}</strong></span>
                          <span>➔</span>
                          <span>Destination: <strong>{action.toFacilityName}</strong></span>
                        </div>
                        <p className="text-[11px] text-slate-400 italic">
                          {action.justification}
                        </p>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                        {action.priority} PRIORITY
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {appliedNotice ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> AI reallocation directives committed to central database!
              </span>
            ) : (
              <span>National Health Mission AI Decision Support Active</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-700 transition"
            >
              Close
            </button>
            {analysis && (
              <button
                id="btn-apply-medpalm-recs"
                onClick={handleApply}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply Reallocations to Central Database</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
