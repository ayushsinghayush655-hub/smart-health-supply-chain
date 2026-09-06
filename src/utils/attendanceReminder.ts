// Internal Device Clock-Based Attendance Reminder & Geofence Utility

export interface AttendanceStatus {
  lastCheckedInAt: string | null;
  intervalMinutes: number; // 240 for Urban, 120 for Rural
  minutesRemaining: number;
  secondsRemaining: number;
  isDue: boolean;
  isOverdue: boolean;
  nextDueAt: string;
}

export function calculateAttendanceStatus(
  lastCheckedInIso: string | null | undefined,
  areaType: 'urban' | 'rural',
  customInterval?: number
): AttendanceStatus {
  const intervalMinutes = customInterval || (areaType === 'urban' ? 240 : 120);
  const now = Date.now();

  let lastTime: number;
  if (!lastCheckedInIso) {
    // Default to having checked in recently to avoid instant jarring alert on fresh load
    lastTime = now - (intervalMinutes - 25) * 60 * 1000;
  } else {
    lastTime = new Date(lastCheckedInIso).getTime();
  }

  const elapsedMs = Math.max(0, now - lastTime);
  const totalIntervalMs = intervalMinutes * 60 * 1000;
  const remainingMs = totalIntervalMs - elapsedMs;

  const minutesRemaining = Math.floor(remainingMs / (60 * 1000));
  const secondsRemaining = Math.max(0, Math.floor((remainingMs % (60 * 1000)) / 1000));
  const isOverdue = remainingMs <= 0;
  const isDue = remainingMs <= 15 * 60 * 1000; // Reminder alert when within 15 minutes or overdue

  const nextDueDate = new Date(lastTime + totalIntervalMs);

  return {
    lastCheckedInAt: lastCheckedInIso || new Date(lastTime).toISOString(),
    intervalMinutes,
    minutesRemaining: isOverdue ? 0 : minutesRemaining,
    secondsRemaining: isOverdue ? 0 : secondsRemaining,
    isDue,
    isOverdue,
    nextDueAt: nextDueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

// Calculate Haversine distance in meters
export function calculateDistanceMeters(
  coords1: { lat: number; lng: number },
  coords2: { lat: number; lng: number }
): number {
  const R = 6371e3; // Earth radius in metres
  const φ1 = (coords1.lat * Math.PI) / 180;
  const φ2 = (coords2.lat * Math.PI) / 180;
  const Δφ = ((coords2.lat - coords1.lat) * Math.PI) / 180;
  const Δλ = ((coords2.lng - coords1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Audio reminder chime using Web Audio API (completely offline-safe!)
export function playAttendanceReminderChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
}
