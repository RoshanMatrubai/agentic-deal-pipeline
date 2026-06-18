# Agentic Deal Pipeline
### Investor's Copilot — Full-Stack AI-Powered VC Deal Analysis Platform

A production-grade monorepo demonstrating a multi-stage agentic pipeline for venture capital deal flow analysis. Drop a pitch deck, paste a company URL, or enter a startup name — the system ingests the signal, runs competitive mapping, generates moat scoring, and surfaces a GP-grade investment memo in real time.

---

## Key Architectural Achievements

**1. Decoupled Agentic State Machine**
The pipeline runs through a strictly typed finite state machine (`idle → ingesting → processing → ready | error`) managed via React's `useReducer`. The frontend and backend phases are choreographed so the UI terminal animation drives through two distinct waves — the first at `t=0ms` (document ingestion), the second at `t=1500ms` (vector synthesis) — before the backend resolves at `t=3500ms`. Zero shared mutable state; every transition is a pure dispatch.

**2. Streaming-Simulated Analysis Engine**
The Express backend simulates a real LLM inference pipeline with a staggered 3.5-second response window — mimicking the latency profile of document parsing → embedding generation → vector index query → LLM memo synthesis. The architecture is designed for drop-in replacement with a real Anthropic/OpenAI streaming endpoint without changing any frontend contract.

**3. Typed End-to-End Data Contract**
A single TypeScript interface tree (`DealData → StartupMetadata | CompetitorEntry[] | InvestmentMemo`) is the canonical schema shared across all four UI modules. The backend fixture payloads are validated against this shape, making the API surface immediately auditable and swap-safe.

**4. Module-Isolated Glassmorphic UI**
Four fully decoupled presentation modules (`IngestionZone`, `BentoMatrix`, `IntelRadar`, `MemoStudio`) share zero direct coupling — they all consume state exclusively via the `CopilotContext` hook. Module switching is handled by a collapsible icon sidebar with CSS-driven expand/collapse (no JavaScript width state), achieving sub-300ms transitions with no layout reflow.

**5. Real-Time Competitive Intelligence Table**
`IntelRadar` renders a live threat-assessment matrix from the `competitiveIntel[]` array with color-coded threat levels (High / Medium / Low), overlap scores, and moat advantage rationale — structured to plug directly into a real market intelligence API (e.g., Crunchbase, Diffbot, Perplexity).

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | React 19 + TypeScript + Vite 8 | SPA shell with ESM-native hot reload |
| Styling | Tailwind CSS v4 + PostCSS | Utility-first dark theme with glassmorphic tokens |
| Animations | Framer Motion v12 | Layout transitions and card entrance animations |
| Icons | Lucide React | Crisp 18px SVG icon set across nav and modules |
| State | React Context + `useReducer` | Typed finite state machine, no external store |
| Backend | Express.js (ESM) + Node.js | REST API with CORS-scoped analysis endpoint |
| Dev Runtime | Vite dev server → Vite proxy → Express | Single `localhost:5173` origin during development |

**Design Token System**

| Token | Value | Usage |
|---|---|---|
| Deep Space BG | `#0B0F19` | Full-bleed application background |
| Glass Surface | `#131B2E/60` + `backdrop-blur` | Card and sidebar surfaces |
| Neon Cyan | `#00F5D4` | Primary accent, live indicators, active nav |
| Electric Violet | `#9D4EDD` | Version badges, secondary data highlights |
| Cyber Pink | `#FF007A` | High-threat alerts, error states |

---

## Data Topologies

```
INPUT SURFACE
─────────────────────────────────────────────────────────────────
  [File Drop]   [URL Paste]   [Company Name]
        │               │               │
        └───────────────┴───────────────┘
                        │
                  { input: string, type: 'file' | 'url' | 'name' }
                        │
                POST /api/analyze
                        │
BACKEND PIPELINE (simulated, 3.5s window)
─────────────────────────────────────────────────────────────────
  t=0ms    → Request received, pipeline initializing
  t=800ms  → Document parsed, embeddings in progress
  t=1800ms → Vector index queried, competitive mapping
  t=2800ms → LLM synthesis running, memo generation
  t=3500ms → Payload finalized, response dispatched
                        │
OUTPUT SCHEMA
─────────────────────────────────────────────────────────────────
  DealData {
    startupMetadata {
      companyName       string
      valueProposition  string
      targetMarket      { tam, sam, som }
      techStack         string[]
    }
    competitiveIntel[] {
      company           string
      overlapScore      string
      threatLevel       'Low' | 'Medium' | 'High'
      moatAdvantage     string
    }
    investmentMemo {
      moatScore         number (1–10)
      riskProfile       { regulatory, acquisitionFriction }
      gpExecutiveSummary  Markdown string
    }
  }
                        │
UI MODULE ROUTING
─────────────────────────────────────────────────────────────────
  ┌──────────────────────────────────────────────────────┐
  │  CopilotContext  (single source of truth)            │
  │  intakeStatus: idle → ingesting → processing → ready │
  └──────────────────────────────────────────────────────┘
        │               │               │               │
  IngestionZone   BentoMatrix     IntelRadar      MemoStudio
  (file/URL drop) (TAM/SAM/SOM    (competitive    (GP memo +
  (live terminal) bento grid)     threat matrix)  moat score)
```

---

## Project Structure

```
hackathon-prep/
├── README.md
├── backend/
│   ├── package.json          # ESM Express server
│   └── server.js             # /api/analyze endpoint + fixture payloads
└── frontend/
    ├── index.html
    ├── vite.config.ts        # Dev proxy: /api → localhost:3001
    ├── src/
    │   ├── App.tsx           # Shell layout + collapsible sidebar nav
    │   ├── main.tsx          # React 19 root + CopilotProvider mount
    │   ├── types/index.ts    # Canonical DealData schema (shared contract)
    │   ├── context/
    │   │   └── CopilotContext.tsx  # useReducer state machine + ingest()
    │   └── components/
    │       ├── IngestionZone.tsx   # Dropzone + live terminal animation
    │       ├── BentoMatrix.tsx     # Value prop, market size, tech stack
    │       ├── IntelRadar.tsx      # Competitive threat assessment table
    │       └── MemoStudio.tsx      # GP memo, moat score, risk profile
    └── package.json
```

---

## Running Locally

```bash
# Terminal 1 — backend
cd backend && npm install && npm run dev

# Terminal 2 — frontend
cd frontend && npm install && npm run dev
```

Frontend: `http://localhost:5173`  
Backend health: `http://localhost:3001/health`

---

*Built as a portfolio artifact demonstrating agentic pipeline architecture, typed full-stack data contracts, and premium dark-mode UI systems.*
