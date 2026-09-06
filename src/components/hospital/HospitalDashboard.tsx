import React, { useState, useEffect } from 'react';
import { UserSession, HospitalRecord, PatientAdmission } from '../../types';
import { calculateAttendanceStatus } from '../../utils/attendanceReminder';
import {
  Building2,
  Bed,
  UserPlus,
  Stethoscope,
  Clock,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Activity,
  HeartPulse,
  Trash2,
  Search,
  Filter,
  Users,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface HospitalDashboardProps {
  userSession: UserSession;
  onOpenAttendance: () => void;
  onOpenMedPalm: () => void;
  lastAttendanceIso?: string;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  userSession,
  onOpenAttendance,
  onOpenMedPalm,
  lastAttendanceIso,
}) => {
  const [hospital, setHospital] = useState<HospitalRecord | null>(null);
  const [admissions, setAdmissions] = useState<PatientAdmission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Admission Form State
  const [patientName, setPatientName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('Male');
  const [triagePriority, setTriagePriority] = useState<'RED_CRITICAL' | 'YELLOW_URGENT' | 'GREEN_STABLE'>('YELLOW_URGENT');
  const [department, setDepartment] = useState<'General Medicine' | 'Pediatrics' | 'Cardiology' | 'Trauma & Emergency' | 'Infectious Diseases' | 'ICU'>('General Medicine');
  const [attendingDoctor, setAttendingDoctor] = useState<string>('Dr. Anita Roy (MD, Infectious Diseases)');
  const [isAdmitting, setIsAdmitting] = useState<boolean>(false);
  const [admissionSuccessNotice, setAdmissionSuccessNotice] = useState<string | null>(null);

  const areaType = userSession.areaType || 'urban';
  const attendanceStatus = calculateAttendanceStatus(lastAttendanceIso, areaType, userSession.attendanceIntervalMinutes || 240);

  useEffect(() => {
    fetchHospitalData();
  }, [userSession.facilityId]);

  const fetchHospitalData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hospital/${userSession.facilityId}`);
      if (res.ok) {
        const data = await res.json();
        setHospital(data.hospital);
        setAdmissions(data.admissions || []);
      }
    } catch (e) {
      console.error('Failed to load hospital data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdmitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !age) return;

    setIsAdmitting(true);
    setAdmissionSuccessNotice(null);

    try {
      const bedNumber = `${department.slice(0, 3).toUpperCase()}-B${Math.floor(Math.random() * 30 + 1)}`;
      const res = await fetch('/api/hospital/admit-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: userSession.facilityId,
          patientName,
          age,
          gender,
          triagePriority,
          department,
          bedNumber,
          attendingDoctor,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAdmissions((prev) => [data.admission, ...prev]);
        if (hospital) {
          setHospital({
            ...hospital,
            occupiedBeds: hospital.occupiedBeds + 1,
            icuOccupied: department === 'ICU' ? hospital.icuOccupied + 1 : hospital.icuOccupied,
          });
        }
        setAdmissionSuccessNotice(`Patient ${patientName} admitted in real time. Allocated ${bedNumber}. Bed counts updated on District Map.`);
        setTimeout(() => setAdmissionSuccessNotice(null), 5000);

        // Reset form
        setPatientName('');
        setAge('');
      }
    } catch (err) {
      console.error('Admission failed:', err);
    } finally {
      setIsAdmitting(false);
    }
  };

  const handleDischargePatient = async (admissionId: string) => {
    try {
      const res = await fetch('/api/hospital/discharge-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admissionId, hospitalId: userSession.facilityId }),
      });
      if (res.ok) {
        setAdmissions((prev) =>
          prev.map((a) => (a.id === admissionId ? { ...a, status: 'DISCHARGED' } : a))
        );
        if (hospital && hospital.occupiedBeds > 0) {
          setHospital({ ...hospital, occupiedBeds: hospital.occupiedBeds - 1 });
        }
      }
    } catch (e) {
      console.error('Discharge failed:', e);
    }
  };

  if (isLoading || !hospital) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const bedOccupancyRate = Math.round((hospital.occupiedBeds / hospital.totalBeds) * 100);
  const availableBeds = hospital.totalBeds - hospital.occupiedBeds;

  return (
    <div className="space-y-6">
      {/* Hospital Identity & Attendance Clock Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                GOVERNMENT SECONDARY/TERTIARY HEALTHCARE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                HOSPITAL ID: {hospital.id}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              {hospital.name}
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {hospital.type}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Live Clinical Ward Surveillance, Emergency Triage, Real-time Bed Count Synchronization with District Medical Officer.
            </p>
          </div>

          {/* Hospital Staff Attendance Compliance Card (Same system as PHC) */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
            attendanceStatus.isOverdue
              ? 'bg-rose-950/40 border-rose-800 text-rose-300'
              : attendanceStatus.isDue
              ? 'bg-amber-950/40 border-amber-800 text-amber-300'
              : 'bg-slate-800/80 border-slate-700 text-slate-300'
          }`}>
            <div className="space-y-0.5">
              <div className="text-[11px] font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Duty Medical Attendance (240m Urban)</span>
              </div>
              <div className="text-lg font-mono font-bold">
                {attendanceStatus.isOverdue ? (
                  <span className="text-rose-400 animate-pulse">ATTENDANCE DUE NOW</span>
                ) : (
                  <span>{attendanceStatus.minutesRemaining}m {attendanceStatus.secondsRemaining}s remaining</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400">
                Next required by: {attendanceStatus.nextDueAt} (Internal Clock)
              </div>
            </div>

            <button
              onClick={onOpenAttendance}
              className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Log Photo Check-in</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Live Bed Count Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Bed Capacity</span>
            <Bed className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {hospital.totalBeds}
          </div>
          <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">
            {availableBeds} Currently Vacant & Ready
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Occupied Beds</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {hospital.occupiedBeds} ({bedOccupancyRate}%)
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Real-time feed to DMO Map
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>ICU Bed Availability</span>
            <HeartPulse className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            {hospital.icuOccupied} / {hospital.icuBeds}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {hospital.icuBeds - hospital.icuOccupied} Critical Care Beds Left
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Specialist Attendance</span>
            <Stethoscope className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {hospital.specialistRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {hospital.emergencyResponseMinutes} min Emergency Response Time
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Patient Admission Desk + Live Ward Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Real-Time Patient Admission Desk Form */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-sky-400" />
              Real-Time Patient Admission Desk
            </h3>
            <p className="text-xs text-slate-400">
              Admit incoming patients. Bed availability updates instantaneously in the central database and on DMO maps.
            </p>
          </div>

          <form onSubmit={handleAdmitPatient} className="space-y-3.5">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Patient Full Name *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Ram Charan"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="115"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 42"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Clinical Triage Category
              </label>
              <select
                value={triagePriority}
                onChange={(e) => setTriagePriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="RED_CRITICAL">🔴 RED - Resuscitation / Critical (Immediate Bed)</option>
                <option value="YELLOW_URGENT">🟡 YELLOW - Urgent / Inpatient Admission</option>
                <option value="GREEN_STABLE">🟢 GREEN - Stable Ambulatory Ward</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Admitting Department & Ward
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="General Medicine">General Medicine Ward</option>
                <option value="Infectious Diseases">Infectious Diseases & Epidemic Isolation</option>
                <option value="Pediatrics">Pediatrics Department</option>
                <option value="Cardiology">Cardiology Ward</option>
                <option value="Trauma & Emergency">Trauma & Emergency Unit</option>
                <option value="ICU">Intensive Care Unit (ICU)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Attending Specialist
              </label>
              <input
                type="text"
                value={attendingDoctor}
                onChange={(e) => setAttendingDoctor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={isAdmitting}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Confirm Admission & Allocate Bed</span>
            </button>

            {admissionSuccessNotice && (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{admissionSuccessNotice}</span>
              </div>
            )}
          </form>
        </div>

        {/* Column 2: Live Inpatient Admissions Table & Real-Time Sync */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Inpatient Ward Admissions ({admissions.filter((a) => a.status === 'ADMITTED').length} Active)
              </h3>
              <p className="text-xs text-slate-400">
                Data streams in real-time to the District Medical Officer (DMO) and Med-PaLM predictive logistics model.
              </p>
            </div>
            <button
              onClick={onOpenMedPalm}
              className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1 font-medium underline"
            >
              <Sparkles className="w-3.5 h-3.5" /> View Med-PaLM Logistics Impact
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Triage</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Bed No.</th>
                  <th className="p-3">Admitted</th>
                  <th className="p-3">Attending Doctor</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {admissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-800/40">
                    <td className="p-3">
                      <div className="font-semibold text-white">{adm.patientName}</div>
                      <div className="text-[10px] text-slate-400">{adm.age} yrs • {adm.gender}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        adm.triagePriority === 'RED_CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                          : adm.triagePriority === 'YELLOW_URGENT'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {adm.triagePriority === 'RED_CRITICAL' ? 'CRITICAL' : adm.triagePriority === 'YELLOW_URGENT' ? 'URGENT' : 'STABLE'}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-200">{adm.department}</td>
                    <td className="p-3 font-mono font-bold text-sky-400">{adm.bedNumber}</td>
                    <td className="p-3 font-mono text-slate-400 text-[11px]">
                      {new Date(adm.admittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 text-slate-300 text-[11px]">{adm.attendingDoctor}</td>
                    <td className="p-3">
                      {adm.status === 'ADMITTED' ? (
                        <button
                          onClick={() => handleDischargePatient(adm.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                        >
                          Discharge / Release
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">Discharged</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
