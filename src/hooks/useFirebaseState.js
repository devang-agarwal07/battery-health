import { useState, useEffect, useCallback, useRef } from 'react';
import { database, ref, onValue } from '../firebase';

// ═══════════════════════════════════════════════════════════
// Baseline Constants (same as useBatteryState)
// ═══════════════════════════════════════════════════════════
const Voc = 3.62;
const R_NEW = 0.2;
const R_MAX = 2.5;
const MAX_HISTORY = 60;

function calculateSoH(voltage, current, temperature) {
  const currentAmps = current / 1000;
  const R_measured = currentAmps > 0
    ? Math.abs(Voc - voltage) / currentAmps
    : 0;

  let baseSoH = (1 - ((R_measured - R_NEW) / (R_MAX - R_NEW))) * 100;
  baseSoH = Math.max(0, Math.min(100, baseSoH));

  let tempPenalty = 0;
  if (temperature > 35) {
    tempPenalty = Math.ceil((temperature - 35) / 10) * 10;
  }

  const finalSoH = Math.max(0, Math.round(baseSoH - tempPenalty));
  return { finalSoH, R_measured, baseSoH, tempPenalty };
}

function getSoHTier(soh) {
  if (soh >= 90) return { label: 'Excellent', color: 'text-emerald', bgColor: 'bg-emerald/10', borderColor: 'border-emerald/30' };
  if (soh >= 70) return { label: 'Good', color: 'text-electric-light', bgColor: 'bg-electric/10', borderColor: 'border-electric/30' };
  if (soh >= 50) return { label: 'Degraded', color: 'text-amber', bgColor: 'bg-amber/10', borderColor: 'border-amber/30' };
  return { label: 'Replace Battery', color: 'text-danger', bgColor: 'bg-danger/10', borderColor: 'border-danger/30' };
}

/**
 * Custom hook that listens to Firebase Realtime Database
 * for battery telemetry pushed by the Python bridge script.
 *
 * This enables real-time monitoring from ANY device (phone, tablet, etc.)
 * without needing a direct USB/Serial connection.
 */
export function useFirebaseState() {
  const [voltage, setVoltage] = useState(0);
  const [current, setCurrent] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [history, setHistory] = useState([]);
  const [testDuration, setTestDuration] = useState(0);
  const [isLogging, setIsLogging] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isSystemOff, setIsSystemOff] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const readingCountRef = useRef(0);

  // Compute derived values
  const { finalSoH, R_measured, baseSoH, tempPenalty } = calculateSoH(voltage, current, temperature);
  const power = parseFloat((voltage * current).toFixed(1));
  const tier = getSoHTier(finalSoH);

  const isThermalWarning = temperature > 45;
  const voltageStatus = voltage >= 3.0 && voltage <= 4.2 ? 'Stable' : voltage < 3.0 ? 'Low' : 'High';

  // Listen to Firebase Realtime Database
  useEffect(() => {
    const latestRef = ref(database, 'battery/latest');

    const unsubscribe = onValue(latestRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setIsFirebaseConnected(true);

      if (data.systemOff) {
        setIsSystemOff(true);
        return;
      }

      setIsSystemOff(false);
      setVoltage(data.voltage ?? 0);
      setCurrent(data.current ?? 0);
      setTemperature(data.temperature ?? 0);

      readingCountRef.current += 1;
      setTestDuration(readingCountRef.current);

    }, (error) => {
      console.error('Firebase listener error:', error);
      setIsFirebaseConnected(false);
    });

    return () => unsubscribe();
  }, []);

  // Record history for charts whenever values change
  useEffect(() => {
    if (voltage === 0 && current === 0) return; // Skip initial zeros

    setHistory(prev => {
      const now = new Date();
      const timeLabel = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const newPoint = {
        time: timeLabel,
        voltage: parseFloat(voltage.toFixed(2)),
        current: parseFloat(current.toFixed(1)),
        temperature: parseFloat(temperature.toFixed(1)),
        soh: finalSoH,
      };

      const updated = [...prev, newPoint];
      return updated.length > MAX_HISTORY ? updated.slice(-MAX_HISTORY) : updated;
    });
  }, [voltage, current, temperature, finalSoH]);

  const resetCapacity = useCallback(() => {
    setTestDuration(0);
    setHistory([]);
    readingCountRef.current = 0;
  }, []);

  const toggleLogging = useCallback(() => {
    setIsLogging(prev => !prev);
  }, []);

  const exportCSV = useCallback(() => {
    if (history.length === 0) return;

    const headers = 'Time,Voltage (V),Current (mA),Temperature (°C),SoH (%)\n';
    const rows = history.map(h =>
      `${h.time},${h.voltage},${h.current},${h.temperature},${h.soh}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voltguard_firebase_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [history]);

  // These are no-ops for Firebase mode (no serial port to connect)
  const connectToSerial = useCallback(() => {}, []);
  const disconnectSerial = useCallback(() => {}, []);

  return {
    voltage,
    current,
    temperature,
    power,
    finalSoH,
    R_measured,
    baseSoH,
    tempPenalty,
    tier,
    isThermalWarning,
    voltageStatus,
    history,
    testDuration,
    isLogging,
    isSystemOff,
    isFirebaseConnected,
    toggleLogging,
    exportCSV,
    resetCapacity,
    isConnected: isFirebaseConnected,  // aliased so the UI stays compatible
    connectToSerial,
    disconnectSerial,
  };
}
