import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173', methods: ['GET', 'POST', 'OPTIONS'] }))
app.use(express.json({ limit: '1mb' }))

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// ── Utility ─────────────────────────────────────────────────────────────────
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ── Fixture Payloads ─────────────────────────────────────────────────────────

const hardTechPayload = {
  startupMetadata: {
    companyName: 'NeuralForge Systems',
    valueProposition:
      'Purpose-built neural inference chips delivering 40x performance-per-watt over GPU clusters for real-time edge AI deployments at hyperscale.',
    targetMarket: { tam: '$87B', sam: '$19B', som: '$1.2B' },
    techStack: [
      'RISC-V ISA',
      'TSMC 3nm',
      'Custom MLIR Compiler',
      'CUDA-compatible SDK',
      'Kubernetes Operator',
      'PyTorch Runtime',
    ],
  },
  competitiveIntel: [
    {
      company: 'NVIDIA H100',
      overlapScore: '68%',
      threatLevel: 'High',
      moatAdvantage:
        'Purpose-built inference vs general GPU; 40x efficiency edge for non-training workloads',
    },
    {
      company: 'Google TPU v5',
      overlapScore: '54%',
      threatLevel: 'High',
      moatAdvantage:
        'Hardware abstraction layer enables multi-cloud portability vs Google lock-in',
    },
    {
      company: 'Groq LPU',
      overlapScore: '71%',
      threatLevel: 'Medium',
      moatAdvantage:
        'Broader model compatibility; supports non-transformer architectures natively',
    },
    {
      company: 'Cerebras CS-3',
      overlapScore: '42%',
      threatLevel: 'Medium',
      moatAdvantage:
        'Edge deployment form-factor vs datacenter-only Cerebras architecture',
    },
    {
      company: 'Tenstorrent Grayskull',
      overlapScore: '38%',
      threatLevel: 'Low',
      moatAdvantage:
        'TSMC 3nm process node provides 2-generation yield and density advantage',
    },
  ],
  investmentMemo: {
    moatScore: 9,
    riskProfile: {
      regulatory:
        'ITAR/EAR export controls apply to advanced chip architectures; CFIUS review likely at Series B+ for any foreign co-investors.',
      acquisitionFriction:
        'Deep IP encumbrance across 47 issued patents; foundry exclusivity agreement with TSMC through 2027 creates significant M&A complexity.',
    },
    gpExecutiveSummary: `## NeuralForge Systems — GP Investment Thesis

NeuralForge represents a rare vertical integration play in the AI infrastructure stack — combining proprietary silicon, a custom MLIR-based compiler toolchain, and an inference runtime that abstracts hardware complexity for ML engineers.

**Why Now:** The inference cost crisis in production AI (LLM serving costs at $0.06–$0.12/1K tokens on H100s) creates immediate pull for purpose-built silicon. NeuralForge's internal benchmarks show $0.004/1K tokens at equivalent throughput — a 15–30x unit economics advantage.

**Team Signal:** Founders previously led AMD Instinct GPU architecture (Sanjay Mehta, ex-AMD Fellow) and built MLIR compiler infrastructure at Google Brain (Dr. Priya Nair, ex-Staff Research Scientist). Deep HPC domain expertise with prior exits totaling $1.1B.

**Key Risk:** Customer concentration — 2 hyperscaler LOIs represent 78% of projected Year 1 ARR. Channel diversification into Tier-2 cloud providers and on-premise enterprise is a prerequisite for Series B capital deployment at target valuation.`,
  },
}

const saasPayload = {
  startupMetadata: {
    companyName: 'ContextIQ',
    valueProposition:
      'AI-native revenue intelligence platform that auto-populates CRM hygiene, surfaces deal-risk signals 14 days earlier than manual reviews, and generates board-ready pipeline forecasts in real time.',
    targetMarket: { tam: '$42B', sam: '$8.3B', som: '$420M' },
    techStack: [
      'Next.js',
      'PostgreSQL',
      'Temporal.io',
      'GPT-4o',
      'Pinecone',
      'Salesforce API',
      'Stripe Billing',
    ],
  },
  competitiveIntel: [
    {
      company: 'Gong.io',
      overlapScore: '76%',
      threatLevel: 'High',
      moatAdvantage:
        "CRM-first data model vs Gong's conversation-first; deeper pipeline analytics with less rep friction",
    },
    {
      company: 'Clari',
      overlapScore: '82%',
      threatLevel: 'High',
      moatAdvantage:
        "Auto-enrichment removes 94% of manual CRM entry vs Clari's forecast-layer-only approach",
    },
    {
      company: 'Chorus.ai',
      overlapScore: '58%',
      threatLevel: 'Medium',
      moatAdvantage:
        'Bi-directional CRM sync with semantic deduplication; real-time vs Chorus batch processing',
    },
    {
      company: 'People.ai',
      overlapScore: '69%',
      threatLevel: 'Medium',
      moatAdvantage:
        'Embedded deal risk scoring with explainable AI rationale vs black-box People.ai scoring',
    },
    {
      company: 'Aviso AI',
      overlapScore: '45%',
      threatLevel: 'Low',
      moatAdvantage:
        'Native Slack/Teams integration eliminates context-switching overhead in rep workflow',
    },
  ],
  investmentMemo: {
    moatScore: 7,
    riskProfile: {
      regulatory:
        "SOC 2 Type II in progress; GDPR data residency requirements for EU expansion require infrastructure buildout in Q3. No current regulatory blockers for US GTM.",
      acquisitionFriction:
        'Salesforce, HubSpot, and Microsoft Dynamics integration depth creates platform dependency risk. Strategic acquirer pool is large (Salesforce, Adobe, SAP) but deal terms historically compressed 30–40% at acquisition.',
    },
    gpExecutiveSummary: `## ContextIQ — GP Investment Thesis

ContextIQ is capitalizing on a structural breakdown in CRM data quality — Salesforce's own research pegs 91% of CRM data as incomplete or stale within 12 months. ContextIQ's ambient data capture layer and AI reconciliation engine solve this without changing rep behavior.

**Why Now:** Enterprise AI adoption is creating demand for high-fidelity training data pipelines, and revenue teams are the highest-priority structured data asset. CRO-led buying motions with 4-week sales cycles are generating exceptional NRR (142% trailing 12M).

**Traction:** $2.1M ARR, 38 enterprise customers (ACV $55K avg), zero logo churn in 18 months. Pilot-to-paid conversion at 84% — indicating strong product-market fit signal.

**Key Risk:** Go-to-market dependency on outbound SDR motion with $22K blended CAC. Transition to product-led growth or channel partnership model is critical to maintain Rule of 40 compliance at Series B scale. Current burn multiple: 1.4x.`,
  },
}

// ── Routes ───────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.post('/api/analyze', async (req, res) => {
  const { input, type } = req.body
  if (!input || !type) {
    return res.status(400).json({ error: 'Missing required fields: input, type' })
  }

  // Staggered 3.5-second simulation timeline
  // t=0:    Request received, pipeline initializing
  // t=800:  Document parsed, embeddings in progress
  // t=1800: Vector index queried, competitive mapping
  // t=2800: LLM synthesis running, memo generation
  // t=3500: Payload finalized, response dispatched
  await delay(3500)

  const payload = type === 'file' ? hardTechPayload : saasPayload

  res.json({ message: 'Analysis complete', data: payload })
})

// ── Error Handling ────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message)
  res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Investor Copilot backend running on http://localhost:${PORT}`)
})
