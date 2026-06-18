import { useState, useEffect, useRef } from 'react'
import { Upload, Globe, Building2, Loader2, CheckCircle2, LayoutGrid, Radar, FileText, RotateCcw } from 'lucide-react'
import { useCopilot } from '../context/CopilotContext'
import type { InputType, ActiveModule } from '../types'

// ── Terminal line sequences ──────────────────────────────────────────────────

const INGESTING_LINES = [
  '▶  Initializing multi-agent ingestion pipeline...',
  '▶  Parsing document structure and extracting metadata...',
  '▶  Tokenizing input with cl100k_base encoding...',
  '▶  Generating 1,536-dim vector embeddings via text-embedding-3-large...',
  '▶  Running NER pass — founders, product, competitors, funding...',
  '▶  Identifying market size signals (TAM / SAM / SOM)...',
]

const PROCESSING_LINES = [
  '▶  Embeddings indexed. Querying competitive search index...',
  '▶  Mapping market overlap scores across 200+ company profiles...',
  '▶  Running threat classification — Low / Medium / High...',
  '▶  Synthesizing GP investment framework via chain-of-thought...',
  '▶  Scoring moat defensibility across 8 strategic dimensions...',
  '▶  Finalizing risk profile — regulatory, M&A, market...',
  '▶  Structuring final DealData payload...',
]

// ── Mode config ──────────────────────────────────────────────────────────────

const MODE_CONFIG = [
  { type: 'name' as InputType, label: 'Company',    Icon: Building2, placeholder: 'e.g. Stripe, Figma, Notion' },
  { type: 'url'  as InputType, label: 'URL Target', Icon: Globe,     placeholder: 'https://company.com/pitch-deck' },
  { type: 'file' as InputType, label: 'File Upload', Icon: Upload,   placeholder: 'Drop a PDF, deck, or document' },
]

const SUCCESS_MODULES: Array<{ id: ActiveModule; label: string; Icon: typeof LayoutGrid }> = [
  { id: 'bento', label: 'View Matrix',  Icon: LayoutGrid },
  { id: 'radar', label: 'Intel Radar',  Icon: Radar },
  { id: 'memo',  label: 'GP Memo',      Icon: FileText },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function IngestionZone() {
  const { intakeStatus, ingest, dealData, setActiveModule, reset } = useCopilot()

  // Input state
  const [selectedType, setSelectedType] = useState<InputType>('name')
  const [inputValue, setInputValue]     = useState('')
  const [isDragOver, setIsDragOver]     = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Terminal state
  const [terminalLines, setTerminalLines]   = useState<string[]>([])
  const [terminalVisible, setTerminalVisible] = useState(false)
  const [terminalFading, setTerminalFading]   = useState(false)
  const terminalBodyRef = useRef<HTMLDivElement>(null)

  const isLocked   = intakeStatus === 'ingesting' || intakeStatus === 'processing'
  const showInput  = intakeStatus === 'idle' || intakeStatus === 'error'
  const showSuccess = intakeStatus === 'ready' && !terminalVisible

  // ── Terminal animation driven by intakeStatus ──────────────────────────────
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    const push = (cb: () => void, ms: number) => { timers.push(setTimeout(cb, ms)) }

    if (intakeStatus === 'ingesting') {
      setTerminalLines([])
      setTerminalFading(false)
      setTerminalVisible(true)
      INGESTING_LINES.forEach((line, i) => push(() => setTerminalLines(p => [...p, line]), i * 210))
    }

    if (intakeStatus === 'processing') {
      PROCESSING_LINES.forEach((line, i) => push(() => setTerminalLines(p => [...p, line]), i * 195))
    }

    if (intakeStatus === 'ready') {
      push(() => setTerminalLines(p => [...p, '✓  Analysis complete. Structured payload ready.']), 180)
      push(() => setTerminalFading(true), 900)
      push(() => setTerminalVisible(false), 1600)
    }

    if (intakeStatus === 'error') {
      push(() => setTerminalLines(p => [...p, '✗  Pipeline error. Check server connection and retry.']), 180)
      push(() => setTerminalFading(true), 2800)
      push(() => setTerminalVisible(false), 3500)
    }

    if (intakeStatus === 'idle') {
      setTerminalVisible(false)
      setTerminalFading(false)
      setTerminalLines([])
    }

    return () => timers.forEach(clearTimeout)
  }, [intakeStatus])

  // Auto-scroll terminal to bottom as lines are added
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
    }
  }, [terminalLines])

  // ── Event handlers ─────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!inputValue.trim() || isLocked) return
    ingest(inputValue.trim(), selectedType)
  }

  const handleFile = (file: File) => {
    setInputValue(file.name)
    ingest(file.name, 'file')
  }

  const handleModeSwitch = (type: InputType) => {
    if (isLocked) return
    setSelectedType(type)
    setInputValue('')
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto mt-8 flex flex-col gap-5" style={{ animation: 'fadeIn 0.3s ease-out' }}>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-100">Deal Ingestion</h2>
        <p className="mt-1 text-sm text-slate-500">
          Search by company name, paste a URL, or upload a pitch deck for full AI analysis
        </p>
      </div>

      {/* Mode selector */}
      <div
        className="flex gap-1 p-1 rounded-lg w-fit"
        style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgb(30 41 59)' }}
      >
        {MODE_CONFIG.map(({ type, label, Icon }) => {
          const isSelected = selectedType === type
          return (
            <button
              key={type}
              onClick={() => handleModeSwitch(type)}
              disabled={isLocked}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all duration-200"
              style={
                isSelected
                  ? { backgroundColor: 'rgba(0,245,212,0.12)', color: '#00F5D4', boxShadow: '0 0 12px rgba(0,245,212,0.15)' }
                  : { color: isLocked ? '#334155' : '#64748b' }
              }
            >
              <Icon size={14} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Input area — only visible when idle or error */}
      <div
        style={{
          overflow: 'hidden',
          maxHeight: showInput ? '160px' : '0px',
          opacity: showInput ? 1 : 0,
          transition: 'max-height 0.35s ease, opacity 0.25s ease',
        }}
      >
        {selectedType === 'file' ? (
          <div
            className="glass-card flex flex-col items-center justify-center gap-4 p-10 cursor-pointer rounded-xl transition-all duration-150"
            style={isDragOver ? { borderColor: '#00F5D4', boxShadow: '0 0 24px rgba(0,245,212,0.15)' } : {}}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragOver(false)
              const file = e.dataTransfer.files[0]
              if (file) handleFile(file)
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={28} style={{ color: isDragOver ? '#00F5D4' : '#475569' }} />
            <div className="text-center">
              <p className="text-sm text-slate-300">Drop file here or click to browse</p>
              <p className="mt-1 text-xs text-slate-600">PDF, DOCX, TXT — up to 10MB</p>
            </div>
            {inputValue && (
              <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(0,245,212,0.1)', color: '#00F5D4' }}>
                {inputValue}
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
          </div>
        ) : (
          <div className="glass-card flex items-center gap-3 px-4 py-3 rounded-xl">
            {selectedType === 'url'
              ? <Globe size={16} className="text-slate-500 shrink-0" />
              : <Building2 size={16} className="text-slate-500 shrink-0" />}
            <input
              type={selectedType === 'url' ? 'url' : 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={MODE_CONFIG.find(m => m.type === selectedType)?.placeholder}
              disabled={isLocked}
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-600 outline-none"
            />
            {inputValue && !isLocked && (
              <button onClick={() => setInputValue('')} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">✕</button>
            )}
          </div>
        )}
      </div>

      {/* Submit button — text modes only, visible when idle/error */}
      {selectedType !== 'file' && showInput && (
        <button
          onClick={handleSubmit}
          disabled={!inputValue.trim() || isLocked}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-150"
          style={
            !inputValue.trim()
              ? { backgroundColor: 'rgba(255,255,255,0.04)', color: '#334155', cursor: 'not-allowed' }
              : { backgroundColor: 'rgba(0,245,212,0.12)', color: '#00F5D4', border: '1px solid rgba(0,245,212,0.25)', boxShadow: '0 0 16px rgba(0,245,212,0.12)' }
          }
        >
          Analyze Deal
        </button>
      )}

      {/* ── Agentic Operations Terminal ──────────────────────────────────── */}
      {terminalVisible && (
        <div
          className="rounded-xl overflow-hidden flex flex-col"
          style={{
            height: '248px',
            opacity: terminalFading ? 0 : 1,
            transition: 'opacity 0.7s ease',
            backgroundColor: 'rgba(8, 12, 22, 0.9)',
            border: `1px solid ${intakeStatus === 'error' ? 'rgba(255,0,122,0.3)' : 'rgba(0,245,212,0.2)'}`,
            boxShadow: intakeStatus === 'error'
              ? '0 0 24px rgba(255,0,122,0.08), inset 0 1px 0 rgba(255,255,255,0.04)'
              : '0 0 24px rgba(0,245,212,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Terminal header bar */}
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            {/* Traffic-light dots */}
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FF5F57' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FFBD2E' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#28CA41' }} />

            <span
              className="ml-2 text-xs font-mono tracking-widest uppercase"
              style={{ color: '#334155' }}
            >
              agentic operations terminal
            </span>

            <div className="ml-auto flex items-center gap-2">
              {(intakeStatus === 'ingesting' || intakeStatus === 'processing') && (
                <Loader2 size={11} className="animate-spin" style={{ color: '#00F5D4' }} />
              )}
              <span
                className="text-xs font-mono tracking-wider uppercase"
                style={{
                  color: intakeStatus === 'error' ? '#FF007A'
                    : intakeStatus === 'ready' ? '#22c55e'
                    : '#00F5D4',
                }}
              >
                {intakeStatus === 'ingesting'  ? 'INGESTING'
                  : intakeStatus === 'processing' ? 'PROCESSING'
                  : intakeStatus === 'error'      ? 'ERROR'
                  : 'COMPLETE'}
              </span>
            </div>
          </div>

          {/* Terminal body */}
          <div
            ref={terminalBodyRef}
            className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1"
            style={{ fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace' }}
          >
            {terminalLines.map((line, i) => {
              const isSuccess = line.startsWith('✓')
              const isError   = line.startsWith('✗')
              return (
                <div
                  key={i}
                  className="flex gap-3 text-xs"
                  style={{ animation: 'fadeIn 0.18s ease-out' }}
                >
                  <span className="shrink-0 select-none" style={{ color: '#1e3a5f', minWidth: '20px' }}>
                    {String(i).padStart(2, '0')}
                  </span>
                  <span style={{ color: isSuccess ? '#22c55e' : isError ? '#FF007A' : '#00F5D4' }}>
                    {line}
                  </span>
                </div>
              )
            })}

            {/* Blinking block cursor during active processing */}
            {(intakeStatus === 'ingesting' || intakeStatus === 'processing') && (
              <div className="flex gap-3 text-xs">
                <span className="shrink-0 select-none" style={{ color: '#1e3a5f', minWidth: '20px' }}>
                  {String(terminalLines.length).padStart(2, '0')}
                </span>
                <span
                  style={{
                    color: '#00F5D4',
                    animation: 'pulse-cyan 1s ease-in-out infinite',
                    fontSize: '0.6rem',
                    lineHeight: '1rem',
                  }}
                >
                  █
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Success card — appears after terminal fades out ────────────── */}
      {showSuccess && dealData && (
        <div
          className="glass-card rounded-xl p-5 flex flex-col gap-4"
          style={{
            animation: 'fadeIn 0.4s ease-out',
            borderColor: 'rgba(0,245,212,0.25)',
            boxShadow: '0 0 28px rgba(0,245,212,0.08)',
          }}
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="shrink-0 mt-0.5" style={{ color: '#00F5D4' }} />
            <div>
              <p className="text-sm font-semibold text-slate-100">
                {dealData.startupMetadata.companyName}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Deal analysis complete — moat score{' '}
                <span style={{ color: '#00F5D4' }}>{dealData.investmentMemo.moatScore}/10</span>
                {' '}·{' '}
                {dealData.competitiveIntel.length} competitors mapped
              </p>
            </div>
          </div>

          {/* Module navigation CTAs */}
          <div className="flex gap-2">
            {SUCCESS_MODULES.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveModule(id)}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs flex-1 transition-all duration-150 font-medium"
                style={{ backgroundColor: 'rgba(0,245,212,0.08)', color: '#00F5D4', border: '1px solid rgba(0,245,212,0.18)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(0,245,212,0.16)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(0,245,212,0.08)' }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Reset */}
          <button
            onClick={reset}
            className="flex items-center justify-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            <RotateCcw size={11} />
            New Analysis
          </button>
        </div>
      )}

      {/* Error retry prompt */}
      {intakeStatus === 'error' && !terminalVisible && (
        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all"
          style={{ animation: 'fadeIn 0.3s ease-out', backgroundColor: 'rgba(255,0,122,0.08)', color: '#FF007A', border: '1px solid rgba(255,0,122,0.2)' }}
        >
          <RotateCcw size={14} />
          Retry Analysis
        </button>
      )}

      {/* Status strip */}
      <div className="flex items-center gap-2 text-xs">
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{
            backgroundColor:
              intakeStatus === 'idle'       ? '#475569'
              : intakeStatus === 'ingesting'  ? '#00F5D4'
              : intakeStatus === 'processing' ? '#9D4EDD'
              : intakeStatus === 'ready'      ? '#22c55e'
              : '#FF007A',
          }}
        />
        <span
          style={{
            color:
              intakeStatus === 'idle'       ? '#475569'
              : intakeStatus === 'ingesting'  ? '#00F5D4'
              : intakeStatus === 'processing' ? '#9D4EDD'
              : intakeStatus === 'ready'      ? '#22c55e'
              : '#FF007A',
          }}
        >
          {intakeStatus === 'idle'       ? 'Ready to ingest'
            : intakeStatus === 'ingesting'  ? 'Ingesting...'
            : intakeStatus === 'processing' ? 'Processing pipeline...'
            : intakeStatus === 'ready'      ? 'Analysis complete'
            : 'Ingestion failed — server unreachable'}
        </span>
      </div>
    </div>
  )
}
