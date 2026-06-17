import { useState, useEffect, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════
// Baseline Constants
// ═══════════════════════════════════════════════════════════
const Voc = 3.62;       // Nominal Open Circuit Voltage (V) — calibrated for demo
const R_NEW = 0.2;      // Ideal internal resistance for a new cell (Ohms)
const R_MAX = 2.5;      // Maximum failed internal resistance threshold (Ohms)

const MAX_HISTORY = 60; // Keep 60 data points for charts

/**
 * Calculates the State of Health percentage from V, I, T.
 */
function calculateSoH(voltage, current, temperature) {
  // Step 1: Measured Internal Resistance
  const currentAmps = current / 1000; // mA → A
  const R_measured = currentAmps > 0
    ? Math.abs(Voc - voltage) / currentAmps
    : 0;

  // Step 2: Base Resistance Health
  let baseSoH = (1 - ((R_measured - R_NEW) / (R_MAX - R_NEW))) * 100;
  baseSoH = Math.max(0, Math.min(100, baseSoH));

  // Step 3: Thermal Stress Penalty
  let tempPenalty = 0;
  if (temperature > 35) {
    tempPenalty = Math.ceil((temperature - 35) / 10) * 10;
  }

  // Step 4: Final SoH
  const finalSoH = Math.max(0, Math.round(baseSoH - tempPenalty));

  return { finalSoH, R_measured, baseSoH, tempPenalty };
}

/**
 * Returns the SoH tier label and color class.
 */
function getSoHTier(soh) {
  if (soh >= 90) return { label: 'Excellent', color: 'text-emerald', bgColor: 'bg-emerald/10', borderColor: 'border-emerald/30' };
  if (soh >= 70) return { label: 'Good', color: 'text-electric-light', bgColor: 'bg-electric/10', borderColor: 'border-electric/30' };
  if (soh >= 50) return { label: 'Degraded', color: 'text-amber', bgColor: 'bg-amber/10', borderColor: 'border-amber/30' };
  return { label: 'Replace Battery', color: 'text-danger', bgColor: 'bg-danger/10', borderColor: 'border-danger/30' };
}

/**
 * Custom hook that manages the entire battery simulation state.
 */
export function useBatteryState() {
  const [voltage, setVoltage] = useState(3.60);
  const [current, setCurrent] = useState(64.3);
  const [temperature, setTemperature] = useState(32.8);
  const [history, setHistory] = useState([]);
  const [testDuration, setTestDuration] = useState(0);
  const [isLogging, setIsLogging] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSystemOff, setIsSystemOff] = useState(false);
  const tickRef = useRef(0);
  
  const portRef = useRef(null);
  const readerRef = useRef(null);
  const keepReadingRef = useRef(false);

  // Compute derived values
  const { finalSoH, R_measured, baseSoH, tempPenalty } = calculateSoH(voltage, current, temperature);
  const power = parseFloat((voltage * current).toFixed(1)); // mW
  const tier = getSoHTier(finalSoH);

  const isThermalWarning = temperature > 45;
  const voltageStatus = voltage >= 3.0 && voltage <= 4.2 ? 'Stable' : voltage < 3.0 ? 'Low' : 'High';

  // Simulate live telemetry updates every second (only if not connected to hardware)
  useEffect(() => {
    if (isConnected) return;

    const interval = setInterval(() => {
      tickRef.current += 1;
      setTestDuration(prev => prev + 1);

      // Small random walk to simulate live sensor data
      setVoltage(prev => {
        const drift = (Math.random() - 0.52) * 0.015;
        return parseFloat(Math.max(2.5, Math.min(4.2, prev + drift)).toFixed(3));
      });

      setCurrent(prev => {
        const drift = (Math.random() - 0.5) * 2.0;
        return parseFloat(Math.max(10, Math.min(200, prev + drift)).toFixed(1));
      });

      setTemperature(prev => {
        const drift = (Math.random() - 0.48) * 0.3;
        return parseFloat(Math.max(15, Math.min(60, prev + drift)).toFixed(1));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Web Serial API Connection
  const connectToSerial = useCallback(async () => {
    if (!('serial' in navigator)) {
      alert('Web Serial API is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      portRef.current = port;
      setIsConnected(true);
      keepReadingRef.current = true;
      
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      let buffer = '';
      
      while (port.readable && keepReadingRef.current) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        if (value) {
          buffer += value;
          let lines = buffer.split('\n');
          // Keep the last partial line in the buffer
          buffer = lines.pop();
          
          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine) {
              // Check for user's specific Arduino format
              if (cleanLine.startsWith('Voltage:')) {
                const vMatch = cleanLine.match(/Voltage:\s*([\d.]+)/);
                if (vMatch) setVoltage(parseFloat(vMatch[1]));
                setIsSystemOff(false);
              } else if (cleanLine.startsWith('Current:')) {
                const iMatch = cleanLine.match(/Current:\s*([\d.]+)/);
                if (iMatch) setCurrent(parseFloat(iMatch[1]));
              } else if (cleanLine.startsWith('Temperature:')) {
                const tMatch = cleanLine.match(/Temperature:\s*([\d.]+)/);
                if (tMatch) setTemperature(parseFloat(tMatch[1]));
              } else if (cleanLine.startsWith('---')) {
                // End of a single reading block
                if (!isSystemOff) setTestDuration(prev => prev + 1);
              } else if (cleanLine.includes('SYSTEM OFF')) {
                setIsSystemOff(true);
              } 
              // Fallback to original comma separated format just in case
              else if (cleanLine.includes(',')) {
                const parts = cleanLine.split(',');
                if (parts.length >= 3) {
                  const v = parseFloat(parts[0]);
                  const i = parseFloat(parts[1]);
                  const t = parseFloat(parts[2]);
                  if (!isNaN(v) && !isNaN(i) && !isNaN(t)) {
                    setVoltage(v);
                    setCurrent(i);
                    setTemperature(t);
                    setTestDuration(prev => prev + 1);
                  }
                }
              }
            }
          }
        }
      }
      
      reader.releaseLock();
    } catch (err) {
      console.error('Error opening or reading serial port:', err);
      setIsConnected(false);
    }
  }, []);

  const disconnectSerial = useCallback(async () => {
    keepReadingRef.current = false;
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch (e) {}
      readerRef.current = null;
    }
    if (portRef.current) {
      try {
        await portRef.current.close();
      } catch (e) {}
      portRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Record history for charts
  useEffect(() => {
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
    a.download = `voltguard_session_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [history]);

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
    toggleLogging,
    exportCSV,
    resetCapacity,
    isConnected,
    connectToSerial,
    disconnectSerial,
  };
}
