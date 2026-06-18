# PROJECT CONTEXT: THE INVESTOR'S COPILOT

## 1. TECH STACK & CONFIGURATION
- **Frontend Framework:** Vite + React + TypeScript
- **Styling Engine:** Tailwind CSS (v3 or v4)
- **Icons:** lucide-react
- **Animations:** framer-motion (for smooth layout transitions and card glows)
- **State Management:** React Context API (Decoupled Data Store)

## 2. PREMIUM DESIGN TOKENS (THEME)
- **Background Deep Space:** `bg-[#0B0F19]` (Deep, dark slate blue)
- **Card Surfaces (Glassmorphic):** `bg-[#131B2E]/60 border border-slate-800 backdrop-blur-md`
- **Neon Accent 1 (Primary/Tech Moat):** `text-[#00F5D4]` / `bg-[#00F5D4]` (Vibrant Cyan)
- **Neon Accent 2 (Live Tracking/Data):** `text-[#7B2CBF]` / `bg-[#9D4EDD]` (Electric Violet)
- **Alert / Risk Indicators:** `text-[#FF007A]` / `bg-[#FF007A]` (Cyber Pink)
- **Typography:** Inter / Sans-Serif system font, tracking-tight headers.

## 3. PROJECT DIRECTORY ARCHITECTURE
```text
/
├── CONTEXT.md                    # This file (Source of Truth)
├── backend/                      # Decoupled mock-server / engine data routes
│   └── server.js                 # Simple Express server for real-time streaming simulation
└── frontend/
    ├── public/
    └── src/
        ├── assets/
        ├── components/           # Atomic, presentation-focused components
        │   ├── IngestionZone.tsx # File dropzone & live parser logs
        │   ├── BentoMatrix.tsx   # Value Prop, Market Size, Tech Stack grids
        │   ├── IntelRadar.tsx    # Live market search & threat assessment table
        │   └── MemoStudio.tsx    # GP Memo view, scoring metrics, export option
        ├── context/
        │   └── CopilotContext.tsx # Centralized app state and engine pipelines
        ├── App.tsx               # Main layout wrapper (Premium Dashboard framework)
        └── main.tsx

{
  "startupMetadata": {
    "companyName": "String",
    "valueProposition": "String",
    "targetMarket": { "tam": "String", "sam": "String", "som": "String" },
    "techStack": ["String"]
  },
  "competitiveIntel": [
    { "company": "String", "overlapScore": "Percentage", "threatLevel": "Low|Medium|High", "moatAdvantage": "String" }
  ],
  "investmentMemo": {
    "moatScore": "Number (1-10)",
    "riskProfile": { "regulatory": "String", "acquisitionFriction": "String" },
    "gpExecutiveSummary": "Markdown String"
  }
}