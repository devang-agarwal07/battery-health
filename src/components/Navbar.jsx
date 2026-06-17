import { Activity, Wifi, Shield } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-volt-700/60 bg-volt-850/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-electric to-emerald shadow-lg shadow-electric/20">
            <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
              VoltGuard <span className="font-mono text-volt-500">//</span>{' '}
              <span className="gradient-text">Smart Battery Health Monitor</span>
            </h1>
            <p className="hidden text-[11px] font-medium tracking-widest text-volt-500 uppercase sm:block">
              Real-Time BHMS Dashboard
            </p>
          </div>
        </div>

        {/* Connection Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-emerald/20 bg-emerald/5 px-3 py-1.5 sm:px-4">
            <span className="pulse-dot h-2 w-2 rounded-full bg-emerald" />
            <span className="hidden text-xs font-semibold text-emerald sm:inline">
              Device: Connected
            </span>
            <span className="font-mono text-[11px] text-emerald/70">(COM8)</span>
          </div>

          <div className="hidden items-center gap-1.5 text-volt-400 md:flex">
            <Activity className="h-4 w-4 text-electric-light" />
            <span className="text-xs font-medium">Live</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
