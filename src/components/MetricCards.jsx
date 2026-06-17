import { Zap, Gauge, Thermometer } from 'lucide-react';

/* ───────────────────────────────────────────────
   Voltage Card
   ─────────────────────────────────────────────── */
export function VoltageCard({ voltage, status }) {
  return (
    <div className="card-glow group rounded-2xl border border-volt-700/50 bg-volt-800/70 p-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric/10">
            <Zap className="h-4 w-4 text-electric-light" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-volt-400 uppercase">Voltage</span>
        </div>
        <span className="rounded-md border border-volt-600/50 bg-volt-750 px-2 py-0.5 font-mono text-[10px] text-volt-400">
          ADC CH0
        </span>
      </div>

      <div className="mb-1 font-mono text-3xl font-bold tracking-tight text-white">
        {voltage.toFixed(2)}
        <span className="ml-1 text-lg font-medium text-volt-500">V</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${status === 'Stable' ? 'bg-emerald' : status === 'Low' ? 'bg-danger' : 'bg-amber'}`} />
        <span className={`text-xs font-medium ${status === 'Stable' ? 'text-emerald/80' : status === 'Low' ? 'text-danger/80' : 'text-amber/80'}`}>
          STATUS: {status}
        </span>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   Current Card
   ─────────────────────────────────────────────── */
export function CurrentCard({ current, power }) {
  return (
    <div className="card-glow group rounded-2xl border border-volt-700/50 bg-volt-800/70 p-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber/10">
            <Gauge className="h-4 w-4 text-amber-light" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-volt-400 uppercase">Current Draw</span>
        </div>
        <span className="rounded-md border border-volt-600/50 bg-volt-750 px-2 py-0.5 font-mono text-[10px] text-volt-400">
          INA219
        </span>
      </div>

      <div className="mb-1 font-mono text-3xl font-bold tracking-tight text-white">
        {current.toFixed(1)}
        <span className="ml-1 text-lg font-medium text-volt-500">mA</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-amber/60" />
        <span className="text-xs font-medium text-amber/70">
          Power: {power.toFixed(1)} mW
        </span>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   Temperature Card
   ─────────────────────────────────────────────── */
export function TemperatureCard({ temperature, isThermalWarning }) {
  return (
    <div className={`card-glow group rounded-2xl border p-5 backdrop-blur-sm ${
      isThermalWarning
        ? 'border-danger/40 bg-danger/5'
        : 'border-volt-700/50 bg-volt-800/70'
    }`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            isThermalWarning ? 'bg-danger/20' : 'bg-emerald/10'
          }`}>
            <Thermometer className={`h-4 w-4 ${isThermalWarning ? 'text-danger-light' : 'text-emerald-light'}`} />
          </div>
          <span className="text-xs font-semibold tracking-wider text-volt-400 uppercase">Temperature</span>
        </div>
        <span className="rounded-md border border-volt-600/50 bg-volt-750 px-2 py-0.5 font-mono text-[10px] text-volt-400">
          DS18B20
        </span>
      </div>

      <div className="mb-1 font-mono text-3xl font-bold tracking-tight text-white">
        {temperature.toFixed(1)}
        <span className="ml-1 text-lg font-medium text-volt-500">°C</span>
      </div>

      {isThermalWarning ? (
        <div className="thermal-flash flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-danger" />
          <span className="text-xs font-bold text-danger">
            WARNING: Thermal Stress
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
          <span className="text-xs font-medium text-emerald/80">
            STATUS: Nominal
          </span>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────
   SoH Gauge Card
   ─────────────────────────────────────────────── */
export function SoHCard({ soh, tier }) {
  // SVG gauge calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // ~283
  const offset = circumference - (soh / 100) * circumference;

  const gaugeColor =
    soh >= 90 ? '#10b981' :
    soh >= 70 ? '#3b82f6' :
    soh >= 50 ? '#f59e0b' :
    '#ef4444';

  const glowColor =
    soh >= 90 ? 'rgba(16, 185, 129, 0.3)' :
    soh >= 70 ? 'rgba(59, 130, 246, 0.3)' :
    soh >= 50 ? 'rgba(245, 158, 11, 0.3)' :
    'rgba(239, 68, 68, 0.3)';

  return (
    <div className="card-glow group rounded-2xl border border-volt-700/50 bg-volt-800/70 p-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric/10">
            <Zap className="h-4 w-4 text-electric-light" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-volt-400 uppercase">State of Health</span>
        </div>
      </div>

      {/* Radial Gauge */}
      <div className="flex items-center justify-center">
        <div className="relative h-28 w-28">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke="#1e293b"
              strokeWidth="8"
            />
            {/* Glow layer */}
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={glowColor}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="gauge-animate"
              style={{ filter: 'blur(4px)' }}
            />
            {/* Active arc */}
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={gaugeColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="gauge-animate"
              style={{
                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-bold text-white">{soh}%</span>
          </div>
        </div>
      </div>

      {/* Tier Badge */}
      <div className="mt-2 flex justify-center">
        <span className={`rounded-full border px-3 py-1 text-[11px] font-bold tracking-wider uppercase ${tier.color} ${tier.bgColor} ${tier.borderColor}`}>
          {tier.label}
        </span>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   Power Card
   ─────────────────────────────────────────────── */
export function PowerCard({ power }) {
  // Max expected power is around 4.2V * 200mA = 840mW. Let's set a scale of 1000mW for the bar.
  const maxPower = 1000;
  const powerPercentage = Math.min(100, Math.max(0, (power / maxPower) * 100));

  return (
    <div className="card-glow group rounded-2xl border border-volt-700/50 bg-volt-800/70 p-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
            <Zap className="h-4 w-4 text-purple-400" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-volt-400 uppercase">Power Output</span>
        </div>
        <span className="rounded-md border border-volt-600/50 bg-volt-750 px-2 py-0.5 font-mono text-[10px] text-volt-400">
          Computed
        </span>
      </div>

      <div className="mb-3 font-mono text-3xl font-bold tracking-tight text-white">
        {power.toFixed(1)}
        <span className="ml-1 text-lg font-medium text-volt-500">mW</span>
      </div>

      {/* Power Bar */}
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-volt-700/50">
        <div 
          className="h-full rounded-full bg-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${powerPercentage}%` }}
        />
      </div>
      <div className="mt-1 text-right text-[10px] text-volt-500 font-mono">{maxPower} mW Max</div>
    </div>
  );
}
