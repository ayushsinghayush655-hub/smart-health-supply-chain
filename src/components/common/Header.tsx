import React, { useState, useEffect } from 'react';
import { UserSession, UserRole } from '../../types';
import { OfflineSyncManager } from '../../utils/offlineSync';
import {
  Shield,
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  Sparkles,
  LogOut,
  Building2,
  Stethoscope,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  userSession: UserSession;
  onLogout: () => void;
  onSwitchRole?: (role: UserRole) => void;
  onRoleChange?: (role: UserRole) => void;
  onOpenMedPalm: () => void;
  pendingSyncCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  userSession,
  onLogout,
  onSwitchRole,
  onRoleChange,
  onOpenMedPalm,
  pendingSyncCount = 0,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(OfflineSyncManager.isOnline());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const switchRole = (role: UserRole) => {
    onSwitchRole?.(role);
    onRoleChange?.(role);
  };

  useEffect(() => {
    const handleConnectivity = (e: any) => {
      setIsOnline(e.detail?.isOnline ?? OfflineSyncManager.isOnline());
    };
    const handleSyncComplete = (e: any) => {
      setSyncToast(e.detail?.message || 'Synced to central database');
      setTimeout(() => setSyncToast(null), 4000);
    };

    window.addEventListener('connectivity-change', handleConnectivity);
    window.addEventListener('offline-queue-synced', handleSyncComplete);

    return () => {
      window.removeEventListener('connectivity-change', handleConnectivity);
      window.removeEventListener('offline-queue-synced', handleSyncComplete);
    };
  }, []);

  const handleToggleOffline = () => {
    const newState = OfflineSyncManager.toggleSimulatedOffline();
    setIsOnline(newState);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const result = await OfflineSyncManager.triggerSync();
    setIsSyncing(false);
    if (result.message) {
      setSyncToast(result.message);
      setTimeout(() => setSyncToast(null), 4000);
    }
  };

  const getDashboardLabel = () => {
    switch (userSession.role) {
      case 'PHC_INCHARGE':
        return 'PHC Incharge Portal';
      case 'DISTRICT_MEDICAL_OFFICER':
        return 'District Medical Officer (DMO) Command';
      case 'GOVT_HOSPITAL':
        return 'Government Hospital Clinical Command';
    }
  };

  return (
    <header id="aarogya-main-header" className="w-full bg-slate-50 text-slate-900 border-b border-slate-200 sticky top-0 z-40 shadow-md">
      {/* Tricolor National Stripe */}
      <div className="h-1.5 w-full grid grid-cols-3">
        <div className="bg-[#FF9933]"></div>
        <div className="bg-white"></div>
        <div className="bg-[#138808]"></div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Govt of India Emblem & System Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-700 shadow-inner">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-600">
                Government of India
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 font-mono">
                NHM-UP-DIST
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Vitality <span className="text-xs font-normal text-slate-600 hidden sm:inline">| {getDashboardLabel()}</span>
            </h1>
          </div>
        </div>

        {/* Center: Gemini & Sync Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Gemini Engine Trigger */}
          <button
            id="btn-open-medpalm"
            onClick={onOpenMedPalm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-medium transition shadow-sm"
            title="Open Multi-Source Gemini Threat & Supply Synthesizer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span className="hidden sm:inline">Gemini</span> AI Synthesizer
          </button>

          {/* Network Connectivity Toggle (Real & Simulation) */}
          <div className="flex items-center rounded-lg border border-slate-300 bg-slate-100/80 px-2.5 py-1 text-xs">
            <button
              id="btn-toggle-connectivity"
              onClick={handleToggleOffline}
              className={`flex items-center gap-1.5 font-medium transition cursor-pointer ${
                isOnline ? 'text-emerald-600' : 'text-rose-600 font-semibold'
              }`}
              title="Click to toggle simulated online/offline mode to test resilient local storage"
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
                  <span>Offline Mode</span>
                </>
              )}
            </button>

            {pendingSyncCount > 0 && (
              <button
                id="btn-manual-sync"
                onClick={handleManualSync}
                disabled={isSyncing || !isOnline}
                className="ml-2 pl-2 border-l border-slate-300 flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 disabled:opacity-50"
                title="Pending offline items stored on device. Click to sync."
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{pendingSyncCount} pending</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Active Role, Switcher & Logout */}
        <div className="flex items-center gap-2">
          {/* Quick Switch Dropdown */}
          <div className="relative">
            <button
              id="btn-role-switcher"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-700 border border-slate-300 text-xs text-slate-800"
            >
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-800">
                {userSession.name.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <div className="font-medium truncate max-w-[130px]">{userSession.name}</div>
                <div className="text-[10px] text-slate-600">{userSession.facilityName}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-1 w-64 rounded-xl bg-slate-100 border border-slate-300 shadow-xl py-1.5 z-50 text-xs">
                
                <button
                  id="btn-logout"
                  onClick={() => {
                    setShowRoleMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-500/10 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out of Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sync Toast Alert */}
      {syncToast && (
        <div className="bg-emerald-900/90 text-emerald-100 text-xs px-4 py-1.5 text-center flex items-center justify-center gap-2 border-t border-emerald-200">
          <RefreshCw className="w-3 h-3 text-emerald-700 animate-spin" />
          <span>{syncToast}</span>
        </div>
      )}
    </header>
  );
};
