import { useState, useEffect, type CSSProperties } from 'react'
import { useDealData } from '../context/CopilotContext'
import type { CompetitorEntry } from '../types'

// ── Threat badge config ───────────────────────────────────────────────────────

const THREAT_CONFIG: Record<
  CompetitorEntry['threatLevel'],
  { color: string; bg: string; border: string; glow: string | null }
> = {
  Low: {
    color:  '#00F5D4',
    bg:     'rgba(0,245,212,0.08)',
    border: '1px solid rgba(0,245,212,0.28)',
    glow:   null,
  },
  Medium: {
    color:  '#9D4EDD',
    bg:     'rgba(157,78,221,0.08)',
    border: '1px solid rgba(157,78,221,0.28)',
    glow:   null,
  },
  High: {
    color:  '#FF007A',
    bg:     'rgba(255,0,122,0.08)',
    border: '1px solid rgba(255,0,122,0.35)',
    glow:   '0 0 10px rgba(255,0,122,0.22)',
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function liveTimestamp(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Pulse({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded ${className ?? ''}`}
      style={{ backgroundColor: 'rgba(255,255,255,0.06)', ...style }}
    />
  )
}

function SkeletonRadar() {
  const COLS = ['22%', '12%', '14%', undefined] as const
  return (
    <div className="flex flex-col gap-5" style={{ animation: 'fadeIn 0.3s ease-out' }}>

      {/* Page header */}
      <div className="flex flex-col gap-2.5">
        <Pulse className="h-6 w-52 rounded-lg" />
        <Pulse className="h-3 w-36" />
      </div>

      {/* Telemetry bar skeleton */}
      <div
        className="glass-card rounded-xl px-5 py-3 flex items-center gap-6"
        style={{ borderColor: 'rgba(0,245,212,0.08)' }}
      >
        <Pulse className="h-2.5 w-44" />
        <Pulse className="h-2.5 w-52" />
        <Pulse className="h-2.5 w-32 ml-auto" />
      </div>

      {/* Table skeleton */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            {COLS.map((w, i) => <col key={i} style={w ? { width: w } : undefined} />)}
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1px solid rgb(30 41 59)' }}>
              {[100, 70, 80, 160].map((w, i) => (
                <th key={i} className="px-5 py-3 text-left">
                  <Pulse style={{ height: '10px', width: `${w}px`, borderRadius: '4px' }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 3 }).map((_, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: i < 2 ? '1px solid rgba(30,41,59,0.5)' : 'none',
                  backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                }}
              >
                <td className="px-5 py-4"><Pulse className="h-4 w-32" /></td>
                <td className="px-5 py-4"><Pulse className="h-4 w-14" /></td>
                <td className="px-5 py-4"><Pulse className="h-6 w-20 rounded-full" /></td>
                <td className="px-5 py-4"><Pulse className="h-4" style={{ maxWidth: '240px' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function IntelRadar() {
  const data = useDealData()
  const [timestamp, setTimestamp] = useState(liveTimestamp)

  useEffect(() => {
    const id = setInterval(() => setTimestamp(liveTimestamp()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!data) return <SkeletonRadar />

  const intel = data.competitiveIntel
  const highCount   = intel.filter(c => c.threatLevel === 'High').length
  const mediumCount = intel.filter(c => c.threatLevel === 'Medium').length

  return (
    <div className="flex flex-col gap-5" style={{ animation: 'fadeIn 0.3s ease-out' }}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-100">
            Competitive Intelligence
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {intel.length} competitors mapped
            {highCount > 0 && (
              <span> · <span style={{ color: '#FF007A' }}>{highCount} high-threat</span></span>
            )}
            {mediumCount > 0 && (
              <span> · <span style={{ color: '#9D4EDD' }}>{mediumCount} medium-threat</span></span>
            )}
          </p>
        </div>
        <span
          className="text-xs font-mono uppercase tracking-widest px-2.5 py-1 rounded-md"
          style={{ color: '#00F5D4', backgroundColor: 'rgba(0,245,212,0.06)', border: '1px solid rgba(0,245,212,0.15)' }}
        >
          Live
        </span>
      </div>

      {/* ── Telemetry bar ────────────────────────────────────────────────── */}
      <div
        className="glass-card rounded-xl px-5 py-3 flex items-center gap-6 flex-wrap"
        style={{ borderColor: 'rgba(0,245,212,0.1)', boxShadow: '0 0 20px rgba(0,245,212,0.04)' }}
      >
        {/* Metric 1: API Search Index */}
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: '#00F5D4', animation: 'pulse-cyan 2s ease-in-out infinite' }}
          />
          <span className="text-xs font-mono text-slate-500">
            API Search Index:{' '}
            <span style={{ color: '#00F5D4' }}>Connected</span>
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '14px', backgroundColor: 'rgba(255,255,255,0.07)' }} />

        {/* Metric 2: Overlap Engine */}
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: '#9D4EDD', animation: 'pulse-cyan 2s ease-in-out infinite 0.6s' }}
          />
          <span className="text-xs font-mono text-slate-500">
            Overlap Processing Engine:{' '}
            <span style={{ color: '#9D4EDD' }}>Active</span>
          </span>
        </div>

        {/* Live timestamp — right-aligned */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-600">Refresh</span>
          <span className="text-xs font-mono tabular-nums" style={{ color: '#475569' }}>
            {timestamp}
          </span>
        </div>
      </div>

      {/* ── Threat Assessment Data Matrix ────────────────────────────────── */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            <col style={{ width: '22%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '14%' }} />
            <col />
          </colgroup>

          <thead>
            <tr style={{ borderBottom: '1px solid rgb(30 41 59)' }}>
              {[
                'Competitor',
                'Market Overlap',
                'Threat Level',
                'Core Moat Advantage',
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-mono uppercase tracking-widest text-slate-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {intel.map((entry, idx) => {
              const threat     = THREAT_CONFIG[entry.threatLevel]
              const overlapPct = parseInt(entry.overlapScore.replace('%', ''), 10)
              const isEven     = idx % 2 === 0

              return (
                <tr
                  key={idx}
                  className="transition-colors duration-100"
                  style={{
                    borderBottom:    idx < intel.length - 1 ? '1px solid rgba(30,41,59,0.5)' : 'none',
                    backgroundColor: isEven ? 'rgba(255,255,255,0.01)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'rgba(255,255,255,0.03)'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                      isEven ? 'rgba(255,255,255,0.01)' : 'transparent'
                  }}
                >
                  {/* Competitor */}
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-slate-200 truncate block">
                      {entry.company}
                    </span>
                  </td>

                  {/* Market Overlap */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span
                        className="text-sm font-mono font-semibold tabular-nums"
                        style={{ color: '#00F5D4' }}
                      >
                        {entry.overlapScore}
                      </span>
                      {/* Mini overlap bar */}
                      <div
                        style={{
                          width: '44px', height: '3px',
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          borderRadius: '2px', overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${overlapPct}%`, height: '100%',
                            background: 'linear-gradient(90deg, #00F5D4, rgba(0,245,212,0.5))',
                            borderRadius: '2px',
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Threat Level badge */}
                  <td className="px-5 py-4">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-mono"
                      style={{
                        color:           threat.color,
                        backgroundColor: threat.bg,
                        border:          threat.border,
                        boxShadow:       threat.glow ?? 'none',
                      }}
                    >
                      {entry.threatLevel}
                    </span>
                  </td>

                  {/* Core Moat Advantage — truncated */}
                  <td className="px-5 py-4 max-w-0">
                    <span
                      className="block text-sm text-slate-400 truncate"
                      title={entry.moatAdvantage}
                    >
                      {entry.moatAdvantage}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Table footer */}
        <div
          className="px-5 py-2.5 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(30,41,59,0.5)', backgroundColor: 'rgba(255,255,255,0.01)' }}
        >
          <span className="text-xs font-mono text-slate-600">
            {intel.length} records · sorted by overlap score
          </span>
          <span className="text-xs font-mono text-slate-600 tabular-nums">
            Analysis timestamp: {timestamp}
          </span>
        </div>
      </div>

    </div>
  )
}
