import React, { useState } from 'react';
import { UserRole, UserSession } from '../../types';
import { Shield, User, Lock, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  onLogin: (session: UserSession) => void;
  currentSession: UserSession;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const roleProfiles: Record<UserRole, UserSession> = {
    PHC_INCHARGE: {
      role: 'PHC_INCHARGE',
      facilityId: 'PHC-01',
      facilityName: 'Kalyanpur Primary Health Centre',
      name: 'Dr. Rajesh Verma (MOIC)',
      inchargeId: 'MOIC-KLY-101',
      storeId: 'STORE-KLY-901',
      areaType: 'rural',
      attendanceIntervalMinutes: 120,
    },
    DMO: {
      role: 'DMO',
      facilityId: 'DMO-HQ',
      facilityName: 'District Health Secretariat, Kanpur Nagar',
      name: 'Dr. Sanjay Bhargava (DMO)',
      designation: 'District Medical Officer',
      inchargeId: 'DMO-UP-04',
      storeId: 'CENTRAL-WAREHOUSE-01',
      areaType: 'urban',
      attendanceIntervalMinutes: 240,
    },
    GOVT_HOSPITAL: {
      role: 'GOVT_HOSPITAL',
      facilityId: 'HOSP-01',
      facilityName: 'GSVM Government Medical College & Hospital',
      name: 'Dr. Meenakshi Sundaram (Medical Superintendent)',
      designation: 'Chief Medical Superintendent',
      inchargeId: 'SUPT-HOSP-01',
      storeId: 'HOSP-CENTRAL-PHARM',
      areaType: 'urban',
      attendanceIntervalMinutes: 240,
    },
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    const u = username.toLowerCase().trim();
    const p = password;
    
    if (p !== 'password123') {
      setErrorMsg('Invalid password. (Hint: password123)');
      return;
    }

    if (u === 'moic_phc01') {
      onLogin(roleProfiles['PHC_INCHARGE']);
    } else if (u === 'dmo_kanpur') {
      onLogin(roleProfiles['DMO']);
    } else if (u === 'supt_gsvm_hosp') {
      onLogin(roleProfiles['GOVT_HOSPITAL']);
    } else {
      setErrorMsg('Invalid Username. Use moic_phc01, dmo_kanpur, or supt_gsvm_hosp');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-center items-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-amber-600 font-semibold tracking-wide uppercase">
            <Shield className="w-3.5 h-3.5" />
            <span>Government of India</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Vitality Command & Surveillance
          </h1>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Secure Staff Login
            </h2>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">
                  Official NHM ID / Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium block mb-1">
                  Security Passcode / Token
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {errorMsg && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{errorMsg}</div>}
            
            <div className="p-3 bg-white/80 rounded-xl border border-slate-200 text-xs text-slate-600">
              <p className="font-semibold text-slate-800 mb-1">Demo Credentials:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>PHC Incharge: <b>moic_phc01</b> / password123</li>
                <li>DMO: <b>dmo_kanpur</b> / password123</li>
                <li>Hospital Supt: <b>supt_gsvm_hosp</b> / password123</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                id="btn-login-submit"
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-slate-900 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Secure Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
