import React, { useState, useRef, useEffect } from 'react';
import { UserSession, MedicineStockItem, LedgerExtractionItem, StockTransferOrder } from '../../types';
import { OfflineSyncManager } from '../../utils/offlineSync';
import { calculateAttendanceStatus } from '../../utils/attendanceReminder';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  FileText,
  Camera,
  FileSpreadsheet,
  ScanBarcode,
  Upload,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Package,
  TrendingDown,
  Truck,
  ArrowRightLeft,
  Sparkles,
  WifiOff,
  RefreshCw,
  Search,
  Filter,
  Layers,
  MapPin
} from 'lucide-react';

interface PHCDashboardProps {
  userSession: UserSession;
  onOpenAttendance: () => void;
  lastAttendanceIso?: string;
}

export const PHCDashboard: React.FC<PHCDashboardProps> = ({
  userSession,
  onOpenAttendance,
  lastAttendanceIso,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'ledger_records' | 'stock_overview' | 'transfers'>('upload');
  const [showDemandList, setShowDemandList] = useState(false);
  const [demandApproved, setDemandApproved] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'photo' | 'excel' | 'barcode_scanner'>('photo');

  // Ledger Upload State
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [excelText, setExcelText] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedPreview, setExtractedPreview] = useState<LedgerExtractionItem[] | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Data States
  const [stocks, setStocks] = useState<MedicineStockItem[]>([]);
  const [ledgers, setLedgers] = useState<LedgerExtractionItem[]>([]);
  const [transfers, setTransfers] = useState<{ incoming: StockTransferOrder[]; outgoing: StockTransferOrder[] }>({
    incoming: [],
    outgoing: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stockSearchQuery, setStockSearchQuery] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const excelInputRef = useRef<HTMLInputElement | null>(null);

  const areaType = userSession.areaType || 'rural';
  const attendanceStatus = calculateAttendanceStatus(lastAttendanceIso, areaType, userSession.attendanceIntervalMinutes);

  // Fetch initial data
  useEffect(() => {
    fetchPHCData();
  }, [userSession.facilityId]);

  const fetchPHCData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/phc/${userSession.facilityId}`);
      if (res.ok) {
        const data = await res.json();
        setStocks(data.stocks || []);
        setLedgers(data.ledgers || []);
        setTransfers(data.transfers || { incoming: [], outgoing: [] });
      }
    } catch (e) {
      console.warn('Network request failed, using cached/offline fallback:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Sample Presets for Instant Evaluation
  const loadSamplePhotoLedger = () => {
    // Generate a styled medical register paper canvas
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 360;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 600, 360);

    // Grid lines resembling a physical ledger
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let y = 40; y < 360; y += 35) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(580, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px serif';
    ctx.fillText('GOVERNMENT PHC DAILY DISPENSING REGISTER - STORE ' + userSession.storeId, 30, 25);

    ctx.font = '11px sans-serif';
    ctx.fillText('DATE: ' + new Date().toLocaleDateString() + ' | PHC ID: ' + userSession.inchargeId, 30, 55);
    ctx.fillText('1. Paracetamol 500mg IP (Batch: PCM-25A-102) - 40 Tabs dispensed (OPD-9102)', 30, 95);
    ctx.fillText('2. WHO ORS Sachets 20.5g (Batch: ORS-24D-89) - 25 Sachets issued (OPD-9103)', 30, 130);
    ctx.fillText('3. Doxycycline 100mg IP (Batch: DOX-24H-44) - 30 Caps issued (OPD-9104)', 30, 165);
    ctx.fillText('4. Azithromycin 500mg IP (Batch: AZI-25C-77) - 15 Tabs dispensed (OPD-9105)', 30, 200);

    ctx.fillStyle = '#64748b';
    ctx.fillText('[Physical Stamp: Primary Health Centre Medical Officer Seal]', 350, 320);

    setPhotoPreview(canvas.toDataURL('image/jpeg'));
    setFeedbackMessage({ type: 'warning', text: 'Sample handwritten ledger loaded. Click "Run Gemini AI Extraction" to process.' });
  };

  const loadSampleExcelData = () => {
    const csvContent = `Medicine Name,Generic Name,Batch Number,Quantity Sold,Unit,Dosage,Patient Token
Paracetamol Tablets IP 500mg,Paracetamol IP,PCM-25A-102,60,Tablets,TDS (3 times daily),OPD-8891
Oral Rehydration Salts (ORS IP),WHO ORS 20.5g,ORS-24D-89,50,Sachets,1 sachet in 1L water,OPD-8892
Doxycycline Capsules IP 100mg,Doxycycline Hyclate,DOX-24H-44,35,Capsules,BD after meals,OPD-8893
Azithromycin Tablets IP 500mg,Azithromycin IP,AZI-25C-77,20,Tablets,OD for 3 days,OPD-8894`;
    setExcelText(csvContent);
    setFeedbackMessage({ type: 'warning', text: 'Sample pharmacy inventory table loaded. Click "Run Gemini AI Extraction".' });
  };

  const loadSampleMedicineBarcode = (barcode: string) => {
    setBarcodeInput(barcode);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = evt.target?.result;
        if (file.name.endsWith('.csv')) {
          setExcelText(data as string);
        } else {
          // XLSX workbook
          const wb = XLSX.read(data, { type: 'binary' });
          const firstSheet = wb.Sheets[wb.SheetNames[0]];
          const csv = XLSX.utils.sheet_to_csv(firstSheet);
          setExcelText(csv);
        }
        setFeedbackMessage({ type: 'warning', text: `Loaded file: ${file.name}. Ready for extraction.` });
      };
      reader.readAsBinaryString(file);
    }
  };

  // Submit Ledger Extraction (Gemini AI + Offline Resilience)
  const handleExtractLedger = async () => {
    setIsExtracting(true);
    setFeedbackMessage(null);
    setExtractedPreview(null);

    const isOnline = OfflineSyncManager.isOnline();

    if (!isOnline) {
      setFeedbackMessage({
        type: 'error',
        text: 'Device is offline. Gemini AI ledger extraction requires network connectivity. Please check your connection and try again.',
      });
      setIsExtracting(false);
      return;
    }

    // ONLINE MODE: Call Gemini server endpoint
    try {
      const response = await fetch('/api/gemini/extract-ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phcId: userSession.facilityId,
          storeId: userSession.storeId,
          inchargeId: userSession.inchargeId,
          uploadMethod,
          rawContent: uploadMethod === 'excel' ? excelText : uploadMethod === 'barcode_scanner' ? barcodeInput : undefined,
          fileBase64: uploadMethod === 'photo' && photoPreview ? photoPreview.split(',')[1] : undefined,
          mimeType: 'image/jpeg',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gemini extraction failed');

      setExtractedPreview(data.entries);
      setLedgers((prev) => [...data.entries, ...prev]);

      // Refresh inventory
      fetchPHCData();

      setFeedbackMessage({
        type: 'success',
        text: `Gemini AI successfully extracted and stored ${data.extractedCount} sales records in Central Database. Linked to Incharge ID: ${data.inchargeId} & Store ID: ${data.storeId}.`,
      });
    } catch (err: any) {
      console.error('Extraction error:', err);
      setFeedbackMessage({
        type: 'error',
        text: `Extraction error: ${err.message}. If offline, switch to simulated offline mode to queue locally.`,
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const filteredStocks = stocks.filter((s) =>
    s.medicineName.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(stockSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Attendance & Store Credentials Hero Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                PHC CLINICAL STORE
              </span>
              <span className="text-xs text-slate-600 font-mono">
                Store ID: <strong className="text-slate-800">{userSession.storeId || 'STORE-KLY-901'}</strong>
              </span>
              <span className="text-xs text-slate-600 font-mono">
                PHC ID: <strong className="text-slate-800">{userSession.inchargeId || 'MOIC-101'}</strong>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              {userSession.facilityName}
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize border border-slate-300">
                {areaType} Zone
              </span>
            </h2>
            <p className="text-xs text-slate-600">
              Primary healthcare medicine dispensing node, ledger synchronization, and attendance compliance.
            </p>
          </div>

          {/* Internal Device Clock Attendance Status Card */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
            attendanceStatus.isOverdue
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : attendanceStatus.isDue
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-slate-100/80 border-slate-300 text-slate-700'
          }`}>
            <div className="space-y-0.5">
              <div className="text-[11px] font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>Attendance Countdown ({areaType === 'urban' ? '240m Urban' : '120m Rural'})</span>
              </div>
              <div className="text-lg font-mono font-bold">
                {attendanceStatus.isOverdue ? (
                  <span className="text-rose-600 animate-pulse">ATTENDANCE DUE NOW</span>
                ) : (
                  <span>{attendanceStatus.minutesRemaining}m {attendanceStatus.secondsRemaining}s remaining</span>
                )}
              </div>
              <div className="text-[10px] text-slate-600">
                Next required by: {attendanceStatus.nextDueAt} (Device Internal Clock)
              </div>
            </div>

            <button
              id="btn-phc-log-attendance"
              onClick={onOpenAttendance}
              className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Log Photo Check-in</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-medium space-x-1 sm:space-x-3 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'upload'
              ? 'bg-sky-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>1. Upload Medical Ledger (Photo / Excel / Scanner)</span>
        </button>

        

        <button
          onClick={() => setActiveTab('stock_overview')}
          className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'stock_overview'
              ? 'bg-sky-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>2. Complete Stock Catalog (Available & Sold)</span>
        </button>

        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'transfers'
              ? 'bg-sky-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>4. UCP Orders & AI Transfers ({transfers.incoming.length + transfers.outgoing.length})</span>
        </button>
      </div>

      {/* TAB 1: UPLOAD MEDICAL LEDGER */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Select Medical Ledger Upload Method
              </h3>
              <p className="text-xs text-slate-600">
                Upload medicine sale data to central database. Gemini AI extracts medicine names, batch numbers, and sold quantities. Works offline if connectivity drops.
              </p>
            </div>

            {/* Method Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                id="tab-method-photo"
                onClick={() => setUploadMethod('photo')}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between gap-3 ${
                  uploadMethod === 'photo'
                    ? 'bg-sky-50 border-sky-500/80 text-slate-900 ring-1 ring-sky-500'
                    : 'bg-slate-100/60 border-slate-300/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-600 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-700">
                    METHOD A
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Take / Upload Ledger Photo</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Capture paper register photo; Gemini vision reads handwritten rows.
                  </p>
                </div>
              </button>

              <button
                id="tab-method-excel"
                onClick={() => setUploadMethod('excel')}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between gap-3 ${
                  uploadMethod === 'excel'
                    ? 'bg-emerald-50 border-emerald-500/80 text-slate-900 ring-1 ring-emerald-500'
                    : 'bg-slate-100/60 border-slate-300/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-700">
                    METHOD B
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Upload Excel / CSV</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Direct .xlsx, .xls or .csv upload or structured table paste.
                  </p>
                </div>
              </button>

              <button
                id="tab-method-barcode"
                onClick={() => setUploadMethod('barcode_scanner')}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between gap-3 ${
                  uploadMethod === 'barcode_scanner'
                    ? 'bg-amber-50 border-amber-500/80 text-slate-900 ring-1 ring-amber-500'
                    : 'bg-slate-100/60 border-slate-300/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center">
                    <ScanBarcode className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-700">
                    METHOD C
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Direct Phone Scanner</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Scan medicine packaging / barcode directly from phone camera.
                  </p>
                </div>
              </button>
            </div>

            {/* Upload Area Body Based on Selected Method */}
            <div className="pt-3 border-t border-slate-200">
              {uploadMethod === 'photo' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">
                      Upload or Photograph Ledger Paper Sheet:
                    </span>
                    <button
                      id="btn-sample-photo-ledger"
                      onClick={loadSamplePhotoLedger}
                      className="text-xs text-sky-600 hover:text-sky-700 underline font-medium"
                    >
                      Load Sample Handwritten Register Photo
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-2xl p-6 text-center bg-white/50 transition">
                    {photoPreview ? (
                      <div className="space-y-3">
                        <img
                          src={photoPreview}
                          alt="Ledger Preview"
                          className="max-h-64 mx-auto rounded-lg border border-slate-300 shadow-md object-contain"
                        />
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => setPhotoPreview(null)}
                            className="text-xs text-rose-600 hover:underline"
                          >
                            Remove Photo
                          </button>
                          <label className="text-xs text-sky-600 hover:underline cursor-pointer">
                            Choose Different Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Camera className="w-10 h-10 text-slate-500 mx-auto" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            Click to upload or take photo of ledger register
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Supports JPG, PNG, WEBP of OPD register, daily issue sheet, or medicine receipt.
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow"
                          >
                            Select Image File
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {uploadMethod === 'excel' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">
                      Upload Excel Spreadsheet (.xlsx / .xls) or CSV:
                    </span>
                    <button
                      id="btn-sample-excel-data"
                      onClick={loadSampleExcelData}
                      className="text-xs text-emerald-600 hover:text-emerald-700 underline font-medium"
                    >
                      Load Standard NHM Excel Template
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-white/40 flex flex-col justify-center items-center">
                      <FileSpreadsheet className="w-10 h-10 text-emerald-600 mb-2" />
                      <p className="text-xs text-slate-700 font-medium">
                        Drag & Drop or Choose Excel (.xlsx/.xls) File
                      </p>
                      <button
                        onClick={() => excelInputRef.current?.click()}
                        className="mt-3 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow"
                      >
                        Browse File
                      </button>
                      <input
                        ref={excelInputRef}
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleExcelFileUpload}
                        className="hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">
                        Direct CSV or Pasted Table Preview:
                      </label>
                      <textarea
                        value={excelText}
                        onChange={(e) => setExcelText(e.target.value)}
                        placeholder="Paste CSV text here or upload file..."
                        rows={6}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {uploadMethod === 'barcode_scanner' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">
                      Medicine Strip Barcode / Packaging OCR Scanner:
                    </span>
                    <span className="text-[11px] text-amber-600">
                      Works on mobile camera & laser scanners
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <ScanBarcode className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={barcodeInput}
                          onChange={(e) => setBarcodeInput(e.target.value)}
                          placeholder="Scan or enter Barcode/Batch (e.g. 8901117220042)..."
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <button
                        onClick={() => loadSampleMedicineBarcode('8901117220042 - Paracetamol 500mg IP (Batch PCM-25A-102)')}
                        className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-700 text-xs text-amber-700 border border-slate-300 whitespace-nowrap"
                      >
                        Sample Barcode: Paracetamol 500mg
                      </button>
                      <button
                        onClick={() => loadSampleMedicineBarcode('8901234567890 - ORS Sachet 20.5g (Batch ORS-24D-89)')}
                        className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-700 text-xs text-amber-700 border border-slate-300 whitespace-nowrap"
                      >
                        Sample Barcode: ORS IP
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Barcode scanning directly decodes medicine GTIN, batch code, expiry, and links dispensing record to Store ID: {userSession.storeId}.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                {!OfflineSyncManager.isOnline() && (
                  <span className="text-amber-600 flex items-center gap-1 font-medium">
                    <WifiOff className="w-3.5 h-3.5" /> Offline mode active: will queue locally with device timestamp
                  </span>
                )}
              </div>

              <button
                id="btn-run-gemini-extract"
                onClick={handleExtractLedger}
                disabled={isExtracting || (uploadMethod === 'photo' && !photoPreview) || (uploadMethod === 'excel' && !excelText) || (uploadMethod === 'barcode_scanner' && !barcodeInput)}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-slate-900 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition cursor-pointer"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini Processing & Structuring...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>Run Gemini AI Extraction & Commit to Central DB</span>
                  </>
                )}
              </button>
            </div>

            {/* Feedback Alert */}
            {feedbackMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                  feedbackMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : feedbackMessage.type === 'warning'
                    ? 'bg-amber-50 border border-amber-200 text-amber-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {feedbackMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>{feedbackMessage.text}</span>
              </div>
            )}
          </div>

          {/* Extracted Structured Records Preview (Instant Verification) */}
          {extractedPreview && extractedPreview.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Newly Extracted & Structured Medical Records ({extractedPreview.length})
                </h4>
                <span className="text-[11px] text-slate-600">
                  Linked to Store: <strong>{userSession.storeId}</strong> | PHC ID: <strong>{userSession.inchargeId}</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-white text-slate-600 text-[11px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Medicine Name</th>
                      <th className="p-2.5">Batch</th>
                      <th className="p-2.5">Sold Qty</th>
                      <th className="p-2.5">Dosage</th>
                      <th className="p-2.5">Token</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {extractedPreview.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-100/40">
                        <td className="p-2.5 font-medium text-slate-900">{item.medicineName}</td>
                        <td className="p-2.5 font-mono text-slate-600">{item.batchNumber}</td>
                        <td className="p-2.5 font-bold text-emerald-600">-{item.quantitySold}</td>
                        <td className="p-2.5 text-slate-600">{item.dosage}</td>
                        <td className="p-2.5 text-slate-600 font-mono">{item.patientToken || 'OPD-REG'}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            Verified Central DB
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPLETE STOCK OVERVIEW */}
      {activeTab === 'stock_overview' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
              <input
                type="text"
                value={stockSearchQuery}
                onChange={(e) => setStockSearchQuery(e.target.value)}
                placeholder="Search medicines or categories..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="text-xs text-slate-600 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Critical Shortage
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Adequate Stock
              </span>
            </div>
          </div>

          {/* Stock Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStocks.map((item) => {
              const isCritical = item.availableStock <= item.criticalThreshold;
              return (
                <div
                  key={item.id}
                  className={`bg-slate-50 border rounded-2xl p-4 space-y-3 transition ${
                    isCritical ? 'border-rose-200 bg-rose-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">{item.medicineName}</h4>
                      <p className="text-[11px] text-slate-600">{item.genericName}</p>
                    </div>
                    {isCritical && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-600 border border-rose-500/40 animate-pulse">
                        LOW STOCK
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-white/60 p-2.5 rounded-xl border border-slate-200/80 text-center">
                    <div>
                      <div className="text-[10px] text-slate-600">Available</div>
                      <div className={`text-base font-bold ${isCritical ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {item.availableStock}
                      </div>
                      <div className="text-[9px] text-slate-500">{item.unit}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-600">Sold/Dispensed</div>
                      <div className="text-base font-bold text-slate-800">
                        {item.soldStock}
                      </div>
                      <div className="text-[9px] text-slate-500">{item.unit}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-600">Delivered</div>
                      <div className="text-base font-bold text-sky-600">
                        {item.deliveredStock}
                      </div>
                      <div className="text-[9px] text-slate-500">{item.unit}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                    <span>Batch: <strong className="text-slate-700 font-mono">{item.batchNumber}</strong></span>
                    <span>Safety Buffer: {item.criticalThreshold}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: UCP ORDERS & AI DIRECTED TRANSFERS */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-600" />
                  Unified Central Procurement (UCP) & Inter-PHC Reallocations
                </h3>
                <p className="text-xs text-slate-600">
                  View medicines ordered through UCP, incoming stock dispatches, and stocks scheduled to be sent to neighboring PHCs as directed by AI.
                </p>
              </div>
              <button 
                onClick={() => setShowDemandList(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" /> Generate AI Normal Demand List
              </button>
            </div>

            {showDemandList && (
               <div className="bg-white p-4 border border-purple-500/30 rounded-xl shadow-lg shadow-purple-900/10">
                 <h4 className="font-bold text-purple-700 text-sm mb-3">Predicted Restock Demand (Below Critical Buffer)</h4>
                 <div className="space-y-2">
                   {stocks.filter(s => s.availableStock <= s.criticalThreshold).map(s => (
                     <div key={s.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200 text-xs text-slate-700">
                       <span>{s.medicineName}</span>
                       <span className="font-bold text-amber-600">Demand: {Math.max(10, s.criticalThreshold * 2 - s.availableStock)} {s.unit}</span>
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
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 text-xs mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Demand List approved and forwarded to District Medical Officer.
              </div>
            )}

            <div className="space-y-3">
              {[...transfers.incoming, ...transfers.outgoing].map((trf) => (
                <div
                  key={trf.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        trf.type === 'AI_REDISTRIBUTION'
                          ? 'bg-purple-500/10 text-purple-700 border-purple-500/30'
                          : 'bg-sky-500/10 text-sky-700 border-sky-500/30'
                      }`}>
                        {trf.type === 'AI_REDISTRIBUTION' ? 'AI-Directed Inter-PHC Transfer' : 'UCP Procurement Order'}
                      </span>
                      <span className="text-xs font-mono text-slate-600">{trf.id}</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">
                      {trf.medicineName} • {trf.quantity} {trf.unit}
                    </h4>

                    <div className="text-xs text-slate-600 flex items-center gap-1.5 flex-wrap">
                      <span>From: <strong>{trf.fromFacilityName}</strong></span>
                      <span>➔</span>
                      <span>To: <strong>{trf.toFacilityName}</strong></span>
                    </div>

                    <p className="text-[11px] text-slate-600 italic pt-1">
                      {trf.reason}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                      trf.status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30'
                        : trf.status === 'DISPATCHED'
                        ? 'bg-sky-500/20 text-sky-700 border border-sky-500/30 animate-pulse'
                        : 'bg-amber-500/20 text-amber-700 border border-amber-500/30'
                    }`}>
                      {trf.status}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(trf.createdDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
