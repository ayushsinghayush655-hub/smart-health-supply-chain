import React, { useState, useEffect } from 'react';
import { UserRole, UserSession, MedPalmAnalysisResult } from './types';
import { Header } from './components/common/Header';
import { LoginModal } from './components/common/LoginModal';
import { AttendanceModal } from './components/common/AttendanceModal';
import { MedPalmModal } from './components/common/MedPalmModal';
import { PHCDashboard } from './components/phc/PHCDashboard';
import { DMODashboard } from './components/dmo/DMODashboard';
import { HospitalDashboard } from './components/hospital/HospitalDashboard';
import { OfflineSyncManager } from './utils/offlineSync';
import { HelpChatWidget } from './components/common/HelpChatWidget';

export default function App() {
  // Authentication & Active Session
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(true);

  // Modals
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState<boolean>(false);
  const [isMedPalmModalOpen, setIsMedPalmModalOpen] = useState<boolean>(false);
  const [lastAttendanceIso, setLastAttendanceIso] = useState<string>(() => new Date().toISOString());
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Initialize offline synchronization listener
  useEffect(() => {
    OfflineSyncManager.initAutoSync();
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    if (newRole === 'PHC_INCHARGE') {
      setUserSession({
        role: 'PHC_INCHARGE',
        facilityId: 'PHC-01',
        facilityName: 'Kalyanpur Primary Health Centre',
        name: 'Dr. Rajesh Verma (MOIC)',
        inchargeId: 'MOIC-KLY-101',
        storeId: 'STORE-KLY-901',
        areaType: 'rural',
        attendanceIntervalMinutes: 120,
      });
    } else if (newRole === 'DMO' || newRole === 'DISTRICT_MEDICAL_OFFICER') {
      setUserSession({
        role: 'DMO',
        facilityId: 'DMO-HQ',
        facilityName: 'District Health Secretariat, Kanpur Nagar',
        name: 'Dr. Sanjay Bhargava (DMO)',
        designation: 'District Medical Officer',
        inchargeId: 'DMO-UP-04',
        storeId: 'CENTRAL-WAREHOUSE-01',
        areaType: 'urban',
        attendanceIntervalMinutes: 240,
      });
    } else if (newRole === 'GOVT_HOSPITAL') {
      setUserSession({
        role: 'GOVT_HOSPITAL',
        facilityId: 'HOSP-01',
        facilityName: 'GSVM Government Medical College & Hospital',
        name: 'Dr. Meenakshi Sundaram (Medical Superintendent)',
        inchargeId: 'SUPT-HOSP-01',
        storeId: 'HOSP-CENTRAL-PHARM',
        areaType: 'urban',
        attendanceIntervalMinutes: 240,
      });
    }
    setIsLoggedOut(false);
  };

  const handleLogin = (session: UserSession) => {
    setUserSession(session);
    setIsLoggedOut(false);
  };

  const handleLogout = () => {
    setIsLoggedOut(true);
  };

  const handleAttendanceSuccess = (timestamp: string) => {
    setLastAttendanceIso(timestamp);
  };

  const handleApplyMedPalmRecommendations = (analysis: MedPalmAnalysisResult) => {
    // Increment refreshKey to trigger re-fetch across active dashboards
    setRefreshKey((prev) => prev + 1);
  };

  // If user clicked Logout / Switch Account, show the Login Portal
  if (isLoggedOut || !userSession) {
    return (
      <LoginModal
        onLogin={handleLogin}
        currentSession={userSession || {
          role: 'PHC_INCHARGE',
          facilityId: 'PHC-01',
          facilityName: 'Kalyanpur Primary Health Centre',
          name: 'Dr. Rajesh Verma (MOIC)',
          inchargeId: 'MOIC-KLY-101',
          storeId: 'STORE-KLY-901',
          areaType: 'rural',
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation & Status Header */}
      <Header
        userSession={userSession}
        onRoleChange={handleRoleChange}
        onOpenMedPalm={() => setIsMedPalmModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Render the specific Dashboard based on active Role */}
        {userSession.role === 'PHC_INCHARGE' && (
          <PHCDashboard
            key={`phc-${refreshKey}`}
            userSession={userSession}
            onOpenAttendance={() => setIsAttendanceModalOpen(true)}
            lastAttendanceIso={lastAttendanceIso}
          />
        )}

        {(userSession.role === 'DMO' || userSession.role === 'DISTRICT_MEDICAL_OFFICER') && (
          <DMODashboard
            key={`dmo-${refreshKey}`}
            userSession={userSession}
            onOpenMedPalm={() => setIsMedPalmModalOpen(true)}
          />
        )}

        {userSession.role === 'GOVT_HOSPITAL' && (
          <HospitalDashboard
            key={`hosp-${refreshKey}`}
            userSession={userSession}
            onOpenAttendance={() => setIsAttendanceModalOpen(true)}
            onOpenMedPalm={() => setIsMedPalmModalOpen(true)}
            lastAttendanceIso={lastAttendanceIso}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            AarogyaNet • National Health Mission • Integrated Health Logistics & Outbreak Warning Platform
          </span>
          <span>
            Offline-First Protocol • Geofenced Biometrics • AI Supply Redistribution
          </span>
        </div>
      </footer>

      {/* Attendance Biometric & Geofence Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        userSession={userSession}
        onAttendanceSuccess={handleAttendanceSuccess}
        lastAttendanceIso={lastAttendanceIso}
      />

      {/* Help & Gemini Chat Widget */}
      <HelpChatWidget />

      {/* Med-PaLM Multi-Agency AI Reasoning Modal */}
      <MedPalmModal
        isOpen={isMedPalmModalOpen}
        onClose={() => setIsMedPalmModalOpen(false)}
        onApplyRecommendations={handleApplyMedPalmRecommendations}
      />
    </div>
  );
}
