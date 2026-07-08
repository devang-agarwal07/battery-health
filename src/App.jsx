import { useState } from 'react';
import Navbar from './components/Navbar';
import { VoltageCard, CurrentCard, TemperatureCard, SoHCard, PowerCard } from './components/MetricCards';
import { DischargeChart, TemperatureChart } from './components/Charts';
import Sidebar from './components/Sidebar';
import { useBatteryState } from './hooks/useBatteryState';
import { useFirebaseState } from './hooks/useFirebaseState';
import { Wifi, Usb } from 'lucide-react';

export default function App() {
  // Check URL param for default mode: ?mode=firebase
  const urlParams = new URLSearchParams(window.location.search);
  const defaultMode = urlParams.get('mode') === 'firebase' ? 'firebase' : 'serial';
  const [dataMode, setDataMode] = useState(defaultMode);

  const serialState = useBatteryState();
  const firebaseState = useFirebaseState();

  // Pick the active data source
  const state = dataMode === 'firebase' ? firebaseState : serialState;

  const {
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
  } = state;

  return (
    <div className="min-h-screen bg-volt-900">
      <Navbar />

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

        {/* ═══ Data Mode Toggle ═══ */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setDataMode('serial')}
            className={`flex items-center gap-2 rounded-l-xl px-4 py-2 text-xs font-bold tracking-wide uppercase transition-all ${
              dataMode === 'serial'
                ? 'bg-electric/20 text-electric-light border border-electric/40'
                : 'bg-volt-800/50 text-volt-500 border border-volt-700/40 hover:bg-volt-750'
            }`}
          >
            <Usb className="h-3.5 w-3.5" />
            USB Serial
          </button>
          <button
            onClick={() => setDataMode('firebase')}
            className={`flex items-center gap-2 rounded-r-xl px-4 py-2 text-xs font-bold tracking-wide uppercase transition-all ${
              dataMode === 'firebase'
                ? 'bg-emerald/20 text-emerald-light border border-emerald/40'
                : 'bg-volt-800/50 text-volt-500 border border-volt-700/40 hover:bg-volt-750'
            }`}
          >
            <Wifi className="h-3.5 w-3.5" />
            Firebase Cloud
          </button>
        </div>

        {/* Firebase connection indicator */}
        {dataMode === 'firebase' && (
          <div className={`mb-4 rounded-xl border p-3 text-center text-xs font-semibold ${
            state.isFirebaseConnected
              ? 'border-emerald/40 bg-emerald/10 text-emerald-light'
              : 'border-amber-500/40 bg-amber-500/10 text-amber-400'
          }`}>
            {state.isFirebaseConnected
              ? '🟢 Connected to Firebase — receiving live data from Arduino bridge'
              : '🟡 Waiting for Firebase data — make sure the Python bridge is running'}
          </div>
        )}

        {/* ═══ KPI Metrics Grid ═══ */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <VoltageCard voltage={voltage} status={voltageStatus} />
          <CurrentCard current={current} power={power} />
          <PowerCard power={power} />
          <TemperatureCard temperature={temperature} isThermalWarning={isThermalWarning} />
          <SoHCard soh={finalSoH} tier={tier} />
        </section>

        {/* ═══ Main Content: Charts + Sidebar ═══ */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          {/* Left — Charts */}
          <div className="flex flex-col gap-6">
            {isSystemOff && (
              <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 text-center">
                <p className="text-lg font-bold text-amber-500">SYSTEM OFF - Press switch to start test</p>
              </div>
            )}
            <DischargeChart data={history} />
            <TemperatureChart data={history} />
          </div>

          {/* Right — Sidebar */}
          <Sidebar
            testDuration={testDuration}
            isLogging={isLogging}
            toggleLogging={toggleLogging}
            exportCSV={exportCSV}
            resetCapacity={resetCapacity}
            R_measured={R_measured}
            baseSoH={baseSoH}
            tempPenalty={tempPenalty}
            isConnected={isConnected}
            connectToSerial={connectToSerial}
            disconnectSerial={disconnectSerial}
            dataMode={dataMode}
          />
        </section>

        {/* ═══ Footer ═══ */}
        <footer className="mt-8 border-t border-volt-700/40 pt-4 pb-6">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-[11px] text-volt-600">
              VoltGuard BHMS v1.0 — Battery Health Monitoring System
            </p>
            <p className="font-mono text-[10px] text-volt-600">
              SoH Algorithm: R_internal Degradation Model + Thermal Compensation
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
