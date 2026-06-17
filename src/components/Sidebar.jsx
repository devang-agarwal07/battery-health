import {
  Play, Download, RotateCcw, CircuitBoard, Timer,
  FlaskConical, Database, Cpu, Usb
} from 'lucide-react';

/**
 * Format seconds into HH:MM:SS.
 */
function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

export default function Sidebar({
  testDuration,
  isLogging,
  toggleLogging,
  exportCSV,
  resetCapacity,
  R_measured,
  baseSoH,
  tempPenalty,
  isConnected,
  connectToSerial,
  disconnectSerial,
}) {
  return (
    <aside className="flex flex-col gap-4">
      {/* ── Test Profile ────────────────────── */}
      <div className="rounded-2xl border border-volt-700/50 bg-volt-800/70 p-5 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric/10">
            <FlaskConical className="h-4 w-4 text-electric-light" />
          </div>
          <span className="text-xs font-bold tracking-wider text-volt-300 uppercase">Test Profile</span>
        </div>

        <div className="mb-4 rounded-xl border border-volt-700/40 bg-volt-850/60 p-3">
          <div className="mb-1 flex items-center gap-2">
            <CircuitBoard className="h-3.5 w-3.5 text-amber-light" />
            <span className="text-[11px] font-semibold text-volt-300">Active Profile</span>
          </div>
          <p className="font-mono text-xs text-white">Static 56Ω Resistor Load</p>
        </div>

        {/* Timer */}
        <div className="rounded-xl border border-volt-700/40 bg-volt-850/60 p-3">
          <div className="mb-1 flex items-center gap-2">
            <Timer className="h-3.5 w-3.5 text-emerald-light" />
            <span className="text-[11px] font-semibold text-volt-300">Test Duration</span>
          </div>
          <p className="font-mono text-lg font-bold tracking-wider text-white">
            {formatDuration(testDuration)}
          </p>
        </div>
      </div>

      {/* ── Diagnostics ─────────────────────── */}
      <div className="rounded-2xl border border-volt-700/50 bg-volt-800/70 p-5 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber/10">
            <Cpu className="h-4 w-4 text-amber-light" />
          </div>
          <span className="text-xs font-bold tracking-wider text-volt-300 uppercase">Diagnostics</span>
        </div>

        <div className="space-y-2.5">
          <DiagRow label="R_internal" value={`${R_measured.toFixed(3)} Ω`} />
          <DiagRow label="Base SoH" value={`${baseSoH.toFixed(1)}%`} />
          <DiagRow label="Thermal Penalty" value={`-${tempPenalty.toFixed(1)}%`} warn={tempPenalty > 0} />
        </div>
      </div>

      {/* ── Action Buttons ──────────────────── */}
      <div className="rounded-2xl border border-volt-700/50 bg-volt-800/70 p-5 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald/10">
            <Database className="h-4 w-4 text-emerald-light" />
          </div>
          <span className="text-xs font-bold tracking-wider text-volt-300 uppercase">Actions</span>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={isConnected ? disconnectSerial : connectToSerial}
            className={`btn-lift flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold tracking-wide uppercase ${
              isConnected
                ? 'border border-amber/30 bg-amber/10 text-amber-light hover:bg-amber/20'
                : 'border border-volt-400/30 bg-volt-400/10 text-volt-300 hover:bg-volt-400/20'
            }`}
          >
            <Usb className="h-4 w-4" />
            {isConnected ? 'Disconnect Arduino' : 'Connect to Arduino'}
          </button>

          <button
            id="btn-toggle-logging"
            onClick={toggleLogging}
            className={`btn-lift flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold tracking-wide uppercase ${
              isLogging
                ? 'border border-danger/30 bg-danger/10 text-danger-light hover:bg-danger/20'
                : 'border border-emerald/30 bg-emerald/10 text-emerald-light hover:bg-emerald/20'
            }`}
          >
            <Play className={`h-3.5 w-3.5 ${isLogging ? 'text-danger-light' : ''}`} />
            {isLogging ? 'Stop Logging' : 'Start Logging Session'}
          </button>

          <button
            id="btn-export-csv"
            onClick={exportCSV}
            className="btn-lift flex w-full items-center justify-center gap-2 rounded-xl border border-electric/30 bg-electric/10 px-4 py-2.5 text-xs font-bold tracking-wide text-electric-light uppercase hover:bg-electric/20"
          >
            <Download className="h-3.5 w-3.5" />
            Export Data (CSV)
          </button>

          <button
            id="btn-reset-counter"
            onClick={resetCapacity}
            className="btn-lift flex w-full items-center justify-center gap-2 rounded-xl border border-volt-600/40 bg-volt-750/50 px-4 py-2.5 text-xs font-bold tracking-wide text-volt-400 uppercase hover:border-volt-500/50 hover:bg-volt-700/50 hover:text-volt-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Capacity Counter
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ── Small helper row ──────────────────── */
function DiagRow({ label, value, warn = false }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-volt-700/30 bg-volt-850/40 px-3 py-2">
      <span className="font-mono text-[11px] text-volt-500">{label}</span>
      <span className={`font-mono text-xs font-semibold ${warn ? 'text-amber' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}
