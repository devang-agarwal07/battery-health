import Navbar from './components/Navbar';
import { VoltageCard, CurrentCard, TemperatureCard, SoHCard, PowerCard } from './components/MetricCards';
import { DischargeChart, TemperatureChart } from './components/Charts';
import Sidebar from './components/Sidebar';
import { useBatteryState } from './hooks/useBatteryState';

export default function App() {
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
  } = useBatteryState();

  return (
    <div className="min-h-screen bg-volt-900">
      <Navbar />

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
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
