import { useState, type ReactNode, type CSSProperties } from 'react'
import { Copy, Download, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useDealData } from '../context/CopilotContext'
import type { DealData } from '../types'

// ── Full dossier generator ────────────────────────────────────────────────────

function generateMemo(data: DealData): string {
  const { startupMetadata: meta, investmentMemo: memo, competitiveIntel: intel } = data
  return [
    `# GP Investment Memo — ${meta.companyName}`,
    '',
    memo.gpExecutiveSummary,
    '',
    `## Market Opportunity`,
    `- TAM: ${meta.targetMarket.tam}`,
    `- SAM: ${meta.targetMarket.sam}`,
    `- SOM: ${meta.targetMarket.som}`,
    '',
    `## Technology Stack`,
    meta.techStack.map(t => `- ${t}`).join('\n'),
    '',
    `## Moat Assessment`,
    `Composite Moat Score: ${memo.moatScore}/10`,
    '',
    `## Risk Profile`,
    `Regulatory: ${memo.riskProfile.regulatory}`,
    '',
    `Acquisition Friction: ${memo.riskProfile.acquisitionFriction}`,
    '',
    `## Competitive Landscape`,
    intel.map(c =>
      `- ${c.company} — ${c.threatLevel} threat (${c.overlapScore} overlap) — ${c.moatAdvantage}`
    ).join('\n'),
  ].join('\n')
}

// ── Markdown renderer ─────────────────────────────────────────────────────────

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold" style={{ color: '#e2e8f0' }}>
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

function renderMarkdown(text: string): ReactNode[] {
  return text.trim().split(/\n\n+/).map((block, i) => {
    const t = block.trim()

    if (t.startsWith('## ')) {
      return (
        <h2 key={i} className="text-base font-semibold tracking-tight text-slate-100 mt-5 mb-0.5 first:mt-0">
          {t.slice(3)}
        </h2>
      )
    }
    if (t.startsWith('# ')) {
      return (
        <h1 key={i} className="text-lg font-bold tracking-tight text-slate-100 mb-1">
          {t.slice(2)}
        </h1>
      )
    }
    if (t.startsWith('> ')) {
      return (
        <blockquote
          key={i}
          className="pl-4 py-1 text-sm text-slate-400 italic"
          style={{ borderLeft: '2px solid rgba(0,245,212,0.4)' }}
        >
          {renderInline(t.slice(2))}
        </blockquote>
      )
    }
    const lines = t.split('\n')
    if (lines.every(l => l.startsWith('- '))) {
      return (
        <ul key={i} className="flex flex-col gap-1.5">
          {lines.map((line, j) => (
            <li key={j} className="flex items-start gap-2.5">
              <span className="shrink-0 text-xs mt-0.5" style={{ color: '#00F5D4' }}>▸</span>
              <span className="text-sm text-slate-300">{renderInline(line.slice(2))}</span>
            </li>
          ))}
        </ul>
      )
    }
    return (
      <p key={i} className="text-sm text-slate-300 leading-relaxed">
        {renderInline(t)}
      </p>
    )
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

function SkeletonMemo() {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex flex-col gap-2">
          <Pulse className="h-6 w-40 rounded-lg" />
          <Pulse className="h-3 w-48" />
        </div>
        <Pulse className="h-7 w-28 rounded-md" />
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">

        {/* Left: document block */}
        <div className="glass-card col-span-7 rounded-xl overflow-hidden">
          <div
            className="px-6 py-3.5 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(30,41,59,0.6)' }}
          >
            <Pulse className="h-2.5 w-32" />
            <Pulse className="h-2.5 w-24" />
          </div>
          <div className="px-6 py-5 flex flex-col gap-3">
            <Pulse className="h-5 w-72 rounded-lg" />
            {['w-full','w-11/12','w-full','w-5/6','w-full','w-4/5','w-full','w-11/12','w-3/4','w-full','w-5/6'].map((w, i) => (
              <Pulse key={i} className={`h-3.5 ${w}`} />
            ))}
          </div>
        </div>

        {/* Right: risk framework */}
        <div className="col-span-5 flex flex-col gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="glass-card rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Pulse style={{ width: '13px', height: '13px', borderRadius: '3px', flexShrink: 0 }} />
                <Pulse className="h-2.5 w-32" />
              </div>
              <div className="flex flex-col gap-2">
                <Pulse className="h-3.5 w-full" />
                <Pulse className="h-3.5 w-5/6" />
                <Pulse className="h-3.5 w-4/5" />
                <Pulse className="h-3.5 w-full" />
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-3">
            <Pulse className="h-10 w-full rounded-lg" />
            <Pulse className="h-10 w-full rounded-lg" />
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MemoStudio() {
  const data = useDealData()
  const [copied, setCopied] = useState(false)

  if (!data) return <SkeletonMemo />

  const memo     = data.investmentMemo
  const fullText = generateMemo(data)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(memo.gpExecutiveSummary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([fullText], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `dossier-${data.startupMetadata.companyName.toLowerCase().replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-100">GP Memo Studio</h2>
          <p className="mt-1 text-sm text-slate-500">
            {data.startupMetadata.companyName}
            <span className="mx-1.5 text-slate-700">·</span>
            Moat Score{' '}
            <span style={{ color: '#00F5D4' }}>{memo.moatScore}/10</span>
          </p>
        </div>
        <span
          className="mt-0.5 text-xs font-mono px-2.5 py-1 rounded-md shrink-0"
          style={{ backgroundColor: 'rgba(0,245,212,0.06)', color: '#00F5D4', border: '1px solid rgba(0,245,212,0.15)' }}
        >
          Dossier Ready
        </span>
      </div>

      {/* ── Split-screen grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6 h-full items-start">

        {/* ── Panel A: Markdown Document Core ── col-span-7 ─────────────── */}
        <div className="glass-card col-span-7 rounded-xl overflow-hidden flex flex-col">

          {/* Sub-header */}
          <div
            className="px-6 py-3.5 flex items-center justify-between shrink-0"
            style={{ borderBottom: '1px solid rgba(30,41,59,0.6)' }}
          >
            <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
              Executive Summary
            </span>
            <span className="text-xs font-mono text-slate-600">
              {data.startupMetadata.companyName}
            </span>
          </div>

          {/* Scrollable markdown body */}
          <div className="overflow-y-auto max-h-[calc(100vh-200px)] px-6 py-5 flex flex-col gap-3">
            {renderMarkdown(memo.gpExecutiveSummary)}
          </div>

        </div>

        {/* ── Panel B: Structural Risk Framework ── col-span-5 ──────────── */}
        <div className="col-span-5 flex flex-col gap-4">

          {/* Risk Card 1: Regulatory */}
          <div className="glass-card rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={13} className="shrink-0" style={{ color: '#FF007A' }} />
              <span
                className="text-xs font-mono uppercase tracking-widest"
                style={{ color: '#FF007A' }}
              >
                Regulatory Risk
              </span>
            </div>
            <div
              className="h-px w-full"
              style={{ backgroundColor: 'rgba(255,0,122,0.1)' }}
            />
            <p className="text-sm text-slate-300 leading-relaxed">
              {memo.riskProfile.regulatory}
            </p>
          </div>

          {/* Risk Card 2: Acquisition Friction */}
          <div className="glass-card rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={13} className="shrink-0" style={{ color: '#FF007A' }} />
              <span
                className="text-xs font-mono uppercase tracking-widest"
                style={{ color: '#FF007A' }}
              >
                Acquisition Friction
              </span>
            </div>
            <div
              className="h-px w-full"
              style={{ backgroundColor: 'rgba(255,0,122,0.1)' }}
            />
            <p className="text-sm text-slate-300 leading-relaxed">
              {memo.riskProfile.acquisitionFriction}
            </p>
          </div>

          {/* ── Action Utility Tier ──────────────────────────────────────── */}
          <div className="flex flex-col gap-3">

            {/* Copy Memo Data */}
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2.5 w-full px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200"
              style={
                copied
                  ? {
                      backgroundColor: 'rgba(0,245,212,0.1)',
                      color:           '#00F5D4',
                      border:          '1px solid rgba(0,245,212,0.28)',
                      boxShadow:       '0 0 14px rgba(0,245,212,0.1)',
                    }
                  : {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color:           '#94a3b8',
                      border:          '1px solid rgba(255,255,255,0.08)',
                    }
              }
            >
              {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
              {copied ? '✓ Copied to Clipboard' : 'Copy Memo Data'}
            </button>

            {/* Download Dossier */}
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2.5 w-full px-5 py-3 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: 'rgba(157,78,221,0.1)',
                color:           '#9D4EDD',
                border:          '1px solid rgba(157,78,221,0.25)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(157,78,221,0.18)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(157,78,221,0.1)'
              }}
            >
              <Download size={15} />
              Download Dossier
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}
