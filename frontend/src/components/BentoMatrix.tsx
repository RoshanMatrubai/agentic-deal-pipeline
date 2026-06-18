import { useState, useEffect } from 'react'
import { useDealData } from '../context/CopilotContext'

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseMarketSize(s: string): number {
  const clean = s.replace(/[$,\s]/g, '')
  const match = clean.match(/^([\d.]+)([BMKbmk])?$/)
  if (!match) return 0
  const n = parseFloat(match[1])
  const unit = match[2]?.toUpperCase()
  return unit === 'B' ? n * 1e9 : unit === 'M' ? n * 1e6 : unit === 'K' ? n * 1e3 : n
}

function getGradeInfo(score: number): { grade: string; color: string; label: string } {
  if (score >= 8) return { grade: 'A', color: '#00F5D4', label: 'Exceptional Moat' }
  if (score >= 6) return { grade: 'B', color: '#9D4EDD', label: 'Strong Moat' }
  if (score >= 4) return { grade: 'C', color: '#f59e0b', label: 'Moderate Moat' }
  if (score >= 2) return { grade: 'D', color: '#f97316', label: 'Weak Moat' }
  return { grade: 'F', color: '#FF007A', label: 'No Clear Moat' }
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function Pulse({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded ${className ?? ''}`}
      style={{ backgroundColor: 'rgba(255,255,255,0.06)', ...style }}
    />
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-12 gap-6 auto-rows-fr" style={{ animation: 'fadeIn 0.3s ease-out' }}>

      {/* Card A skeleton */}
      <div className="glass-card col-span-8 rounded-xl p-7 flex flex-col gap-5 min-h-[220px]">
        <div className="flex items-center justify-between">
          <Pulse className="h-2.5 w-28" />
          <Pulse className="h-6 w-20 rounded-md" />
        </div>
        <Pulse className="h-8 w-56 rounded-lg" />
        <div className="flex flex-col gap-2.5 flex-1">
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-11/12" />
          <Pulse className="h-4 w-3/4" />
        </div>
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex justify-between">
            <Pulse className="h-2.5 w-32" />
            <Pulse className="h-2.5 w-10" />
          </div>
          <Pulse className="h-1.5 w-full rounded-full" />
        </div>
      </div>

      {/* Card B skeleton */}
      <div className="glass-card col-span-4 rounded-xl p-6 flex flex-col items-center justify-center gap-5 min-h-[220px]">
        <Pulse className="h-2.5 w-20" />
        <div
          className="w-36 h-36 rounded-full animate-pulse"
          style={{ border: '8px solid rgba(255,255,255,0.05)' }}
        />
        <div className="flex flex-col items-center gap-2">
          <Pulse className="h-8 w-10 rounded-lg" />
          <Pulse className="h-2.5 w-28" />
        </div>
      </div>

      {/* Card C skeleton */}
      <div className="glass-card col-span-6 rounded-xl p-6 flex flex-col gap-5 min-h-[180px]">
        <Pulse className="h-2.5 w-40" />
        {[100, 68, 18].map((w, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Pulse className="h-3 w-10" />
              <Pulse className="h-3 w-16" />
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <Pulse className={`h-full rounded-full`} style={{ width: `${w}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Card D skeleton */}
      <div className="glass-card col-span-6 rounded-xl p-6 flex flex-col gap-4 min-h-[180px]">
        <Pulse className="h-2.5 w-36" />
        <div className="flex flex-wrap gap-2">
          {[60, 76, 52, 84, 64, 72, 56, 68].map((w, i) => (
            <div
              key={i}
              className="h-7 rounded-md animate-pulse"
              style={{ width: `${w}px`, backgroundColor: 'rgba(255,255,255,0.05)' }}
            />
          ))}
        </div>
      </div>

    </div>
  )
}

// ── TechBadge ─────────────────────────────────────────────────────────────────

function TechBadge({ tech }: { tech: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <span
      className="px-3 py-1.5 text-xs rounded-md font-mono cursor-default select-none transition-all duration-200"
      style={{
        color:           hovered ? '#00F5D4' : '#94a3b8',
        backgroundColor: hovered ? 'rgba(0,245,212,0.08)' : 'rgba(255,255,255,0.04)',
        border:          `1px solid ${hovered ? 'rgba(0,245,212,0.3)' : 'rgba(51,65,85,0.6)'}`,
        boxShadow:       hovered ? '0 0 12px rgba(0,245,212,0.15)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {tech}
    </span>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function BentoMatrix() {
  const data = useDealData()
  const [animated, setAnimated] = useState(false)

  // Trigger entry animations after data lands
  useEffect(() => {
    if (!data) { setAnimated(false); return }
    const t = setTimeout(() => setAnimated(true), 150)
    return () => clearTimeout(t)
  }, [data])

  if (!data) return <SkeletonGrid />

  const { startupMetadata: meta, investmentMemo: memo } = data

  // Derived values
  const score        = memo.moatScore
  const gradeInfo    = getGradeInfo(score)
  const confidence   = Math.min(99, Math.round(score * 4.1 + 58)) // 58–99% range
  const RING_R       = 60
  const RING_C       = 2 * Math.PI * RING_R    // ≈ 376.99
  const ringFill     = animated ? (score / 10) * RING_C : 0

  const tamVal = parseMarketSize(meta.targetMarket.tam)
  const samVal = parseMarketSize(meta.targetMarket.sam)
  const somVal = parseMarketSize(meta.targetMarket.som)

  const marketRows = [
    { key: 'TAM', label: 'Total Addressable Market', value: meta.targetMarket.tam, pct: 100 },
    {
      key: 'SAM', label: 'Serviceable Addressable Market', value: meta.targetMarket.sam,
      pct: tamVal > 0 ? Math.round((samVal / tamVal) * 100) : 60,
    },
    {
      key: 'SOM', label: 'Serviceable Obtainable Market', value: meta.targetMarket.som,
      pct: tamVal > 0 ? Math.round((somVal / tamVal) * 100) : 15,
    },
  ]

  return (
    <div className="grid grid-cols-12 gap-6 auto-rows-fr" style={{ animation: 'fadeIn 0.3s ease-out' }}>

      {/* ── Card A: Strategic Hero Profile ── col-span-8 ──────────────────── */}
      <div className="glass-card col-span-8 rounded-xl p-7 flex flex-col gap-5 min-h-[220px]">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
            Strategic Profile
          </span>
          <span
            className="px-2.5 py-1 rounded-md text-xs font-mono"
            style={{ backgroundColor: 'rgba(0,245,212,0.06)', color: '#00F5D4', border: '1px solid rgba(0,245,212,0.15)' }}
          >
            AI Analysis
          </span>
        </div>

        {/* Company name */}
        <h3 className="text-3xl font-bold tracking-tight text-slate-100 leading-none">
          {meta.companyName}
        </h3>

        {/* Value proposition */}
        <p className="text-base text-slate-300 leading-relaxed flex-1">
          {meta.valueProposition}
        </p>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />

        {/* Parsing confidence gauge */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-600">
              Parsing Confidence
            </span>
            <span className="text-xs font-mono tabular-nums" style={{ color: '#00F5D4' }}>
              {animated ? confidence : 0}%
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width:     `${animated ? confidence : 0}%`,
                background: 'linear-gradient(90deg, #00F5D4, rgba(0,245,212,0.6))',
                boxShadow: '0 0 8px rgba(0,245,212,0.5)',
                transition: 'width 1.1s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
          </div>
        </div>

      </div>

      {/* ── Card B: Moat Ring Workspace ── col-span-4 ─────────────────────── */}
      <div className="glass-card col-span-4 rounded-xl p-6 flex flex-col items-center justify-center gap-4 min-h-[220px]">

        <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
          Moat Score
        </span>

        {/* SVG ring */}
        <div className="relative flex items-center justify-center">
          <svg width={144} height={144} style={{ transform: 'rotate(-90deg)' }}>
            {/* Outer decorative ring */}
            <circle
              cx={72} cy={72} r={RING_R + 12}
              fill="none"
              stroke="rgba(255,255,255,0.02)"
              strokeWidth={1}
            />
            {/* Track */}
            <circle
              cx={72} cy={72} r={RING_R}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={8}
            />
            {/* Inner accent ring */}
            <circle
              cx={72} cy={72} r={RING_R - 14}
              fill="none"
              stroke="rgba(255,255,255,0.02)"
              strokeWidth={1}
            />
            {/* Progress arc */}
            <circle
              cx={72} cy={72} r={RING_R}
              fill="none"
              stroke={gradeInfo.color}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={`${ringFill} ${RING_C}`}
              style={{
                filter:     `drop-shadow(0 0 8px ${gradeInfo.color}) drop-shadow(0 0 20px ${gradeInfo.color}60)`,
                transition: 'stroke-dasharray 1.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
          </svg>

          {/* Center numeric score */}
          <div className="absolute flex flex-col items-center">
            <span
              className="text-4xl font-bold font-mono leading-none tabular-nums"
              style={{ color: gradeInfo.color, filter: `drop-shadow(0 0 12px ${gradeInfo.color}80)` }}
            >
              {score}
            </span>
            <span className="text-xs text-slate-600 mt-1">/10</span>
          </div>
        </div>

        {/* Grade + label */}
        <div className="flex flex-col items-center gap-1 text-center">
          <span
            className="text-2xl font-bold font-mono leading-none"
            style={{ color: gradeInfo.color }}
          >
            {gradeInfo.grade}
          </span>
          <span
            className="text-xs font-mono uppercase tracking-wider"
            style={{ color: gradeInfo.color, opacity: 0.65 }}
          >
            {gradeInfo.label}
          </span>
        </div>

      </div>

      {/* ── Card C: Market Architecture Block ── col-span-6 ───────────────── */}
      <div className="glass-card col-span-6 rounded-xl p-6 flex flex-col gap-5 min-h-[180px]">

        <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
          Market Architecture
        </span>

        <div className="flex flex-col gap-4 flex-1">
          {marketRows.map(({ key, label, value, pct }, i) => {
            const barColor = i < 2
              ? `linear-gradient(90deg, #9D4EDD, rgba(157,78,221,0.5))`
              : `linear-gradient(90deg, #00F5D4, rgba(0,245,212,0.4))`
            const barGlow  = i < 2
              ? '0 0 6px rgba(157,78,221,0.4)'
              : '0 0 6px rgba(0,245,212,0.35)'

            return (
              <div key={key} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono font-bold text-slate-300 shrink-0">{key}</span>
                    <span className="text-xs text-slate-500 truncate">{label}</span>
                  </div>
                  <span
                    className="text-sm font-mono font-semibold tabular-nums shrink-0"
                    style={{ color: i < 2 ? '#9D4EDD' : '#00F5D4' }}
                  >
                    {value}
                  </span>
                </div>
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width:      `${animated ? pct : 0}%`,
                      background: barColor,
                      boxShadow:  barGlow,
                      transition: `width 1.1s ${i * 0.18}s cubic-bezier(0.34, 1.56, 0.64, 1)`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

      </div>

      {/* ── Card D: Technical Stack Blueprint ── col-span-6 ───────────────── */}
      <div className="glass-card col-span-6 rounded-xl p-6 flex flex-col gap-4 min-h-[180px]">

        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
            Technical Stack
          </span>
          <span className="text-xs font-mono text-slate-600">
            {meta.techStack.length} layers
          </span>
        </div>

        <div className="flex flex-wrap gap-2 content-start flex-1">
          {meta.techStack.map((tech) => (
            <TechBadge key={tech} tech={tech} />
          ))}
        </div>

      </div>

    </div>
  )
}
