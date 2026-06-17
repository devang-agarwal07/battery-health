import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { TrendingUp, Thermometer } from 'lucide-react';

/* ───────────────────────────────────────────────
   Custom Tooltip
   ─────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-volt-600/40 bg-volt-850/95 px-4 py-3 shadow-2xl backdrop-blur-md">
      <p className="mb-2 font-mono text-[11px] font-medium text-volt-400">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-volt-300">
            {entry.name}: <span className="font-mono font-semibold text-white">{entry.value}</span>
            <span className="ml-0.5 text-volt-500">
              {entry.name === 'Voltage' ? 'V' : entry.name === 'Current' ? 'mA' : '°C'}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────
   Discharge Profile Chart (Voltage + Current)
   ─────────────────────────────────────────────── */
export function DischargeChart({ data }) {
  return (
    <div className="rounded-2xl border border-volt-700/50 bg-volt-800/70 p-5 backdrop-blur-sm">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric/10">
          <TrendingUp className="h-4 w-4 text-electric-light" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Discharge Profile</h2>
          <p className="text-[11px] text-volt-500">Voltage & Current over time</p>
        </div>

        {/* Legend */}
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-6 rounded-full bg-electric-light" />
            <span className="text-[11px] text-volt-400">Voltage (V)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-6 rounded-full bg-amber" />
            <span className="text-[11px] text-volt-400">Current (mA)</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="voltage"
              domain={[2.5, 4.2]}
              tick={{ fontSize: 10, fill: '#60a5fa' }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `${v}V`}
            />
            <YAxis
              yAxisId="current"
              orientation="right"
              domain={[0, 200]}
              tick={{ fontSize: 10, fill: '#f59e0b' }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              yAxisId="voltage"
              type="monotone"
              dataKey="voltage"
              name="Voltage"
              stroke="#60a5fa"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#60a5fa', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              yAxisId="current"
              type="monotone"
              dataKey="current"
              name="Current"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              strokeDasharray="6 3"
              activeDot={{ r: 4, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   Temperature Chart
   ─────────────────────────────────────────────── */
export function TemperatureChart({ data }) {
  return (
    <div className="rounded-2xl border border-volt-700/50 bg-volt-800/70 p-5 backdrop-blur-sm">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald/10">
          <Thermometer className="h-4 w-4 text-emerald-light" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Thermal Profile</h2>
          <p className="text-[11px] text-volt-500">DS18B20 sensor readout</p>
        </div>

        {/* Threshold line legend */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-[2px] w-5 border-t-2 border-dashed border-danger/60" />
          <span className="text-[11px] text-danger/60">Stress Threshold (45°C)</span>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[15, 60]}
              tick={{ fontSize: 10, fill: '#34d399' }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `${v}°`}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* 45°C threshold reference line */}
            <Line
              type="monotone"
              dataKey={() => 45}
              stroke="#ef4444"
              strokeWidth={1}
              strokeDasharray="8 4"
              dot={false}
              name="Threshold"
              activeDot={false}
            />
            <Area
              type="monotone"
              dataKey="temperature"
              name="Temperature"
              stroke="#34d399"
              strokeWidth={2}
              fill="url(#tempGradient)"
              activeDot={{ r: 4, fill: '#34d399', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
