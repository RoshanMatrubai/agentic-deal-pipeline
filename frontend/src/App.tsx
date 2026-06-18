import { Upload, LayoutGrid, Radar, FileText, type LucideIcon } from 'lucide-react'
import { useCopilot } from './context/CopilotContext'
import type { ActiveModule } from './types'
import IngestionZone from './components/IngestionZone'
import BentoMatrix from './components/BentoMatrix'
import IntelRadar from './components/IntelRadar'
import MemoStudio from './components/MemoStudio'

const MODULES: Array<{ id: ActiveModule; label: string; Icon: LucideIcon }> = [
  { id: 'ingestion', label: 'Ingest', Icon: Upload },
  { id: 'bento',     label: 'Matrix', Icon: LayoutGrid },
  { id: 'radar',     label: 'Intel',  Icon: Radar },
  { id: 'memo',      label: 'Memo',   Icon: FileText },
]

export default function App() {
  const { activeModule, setActiveModule, intakeStatus } = useCopilot()

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0B0F19', color: '#E2E8F0' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <div className="group/sidebar shrink-0">
        <aside
          className="glass-card h-full flex flex-col items-start py-5 gap-1 rounded-none overflow-hidden"
          style={{ width: '64px', transition: 'width 300ms ease' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.width = '224px' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.width = '64px' }}
        >
          {/* Brand */}
          <div className="flex items-center gap-3 px-4 mb-5 w-56 shrink-0">
            <span
              className="shrink-0 font-mono font-bold text-lg"
              style={{ color: '#00F5D4', textShadow: '0 0 8px rgba(0,245,212,0.7)' }}
            >
              IC
            </span>
            <span className="text-sm font-semibold tracking-tight whitespace-nowrap text-slate-100">
              Investor's Copilot
            </span>
          </div>

          {/* Nav */}
          <nav className="flex flex-col w-full gap-1 px-2">
            {MODULES.map(({ id, label, Icon }) => {
              const isActive = activeModule === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveModule(id)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 w-56 text-left shrink-0"
                  style={isActive
                    ? { color: '#00F5D4', backgroundColor: 'rgba(0,245,212,0.1)', boxShadow: '0 0 12px rgba(0,245,212,0.1)' }
                    : { color: '#64748b' }}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.05)'; if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#e2e8f0' }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = ''; if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#64748b' }}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              )
            })}
          </nav>

          {/* Live dot */}
          <div className="mt-auto flex items-center gap-3 px-4 w-56 shrink-0">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: '#00F5D4', animation: 'pulse-cyan 2s ease-in-out infinite' }}
            />
            <span className="text-xs text-slate-500 whitespace-nowrap">LIVE</span>
          </div>
        </aside>
      </div>

      {/* ── Workspace ───────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Header */}
        <header
          className="glass-card rounded-none shrink-0 px-6 py-3 flex items-center justify-between"
          style={{ borderRadius: 0 }}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm" style={{ color: '#00F5D4' }}>//</span>
            <span className="font-mono text-sm text-slate-400">investor-copilot</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: '#00F5D4', animation: 'pulse-cyan 2s ease-in-out infinite' }}
              />
              LIVE
            </span>
            <span className="font-mono text-xs text-slate-500">
              {intakeStatus === 'idle' ? '—' : intakeStatus.toUpperCase()}
            </span>
            <span
              className="px-2 py-0.5 rounded font-mono text-xs"
              style={{ border: '1px solid rgba(123,44,191,0.35)', color: '#9D4EDD' }}
            >
              v1.0
            </span>
          </div>
        </header>

        {/* Module viewport */}
        <main
          key={activeModule}
          className="flex-1 overflow-auto p-6"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          {activeModule === 'ingestion' && <IngestionZone />}
          {activeModule === 'bento'     && <BentoMatrix />}
          {activeModule === 'radar'     && <IntelRadar />}
          {activeModule === 'memo'      && <MemoStudio />}
        </main>
      </div>
    </div>
  )
}
