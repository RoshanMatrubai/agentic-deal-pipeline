export interface StartupMetadata {
  companyName: string
  valueProposition: string
  targetMarket: { tam: string; sam: string; som: string }
  techStack: string[]
}

export interface CompetitorEntry {
  company: string
  overlapScore: string
  threatLevel: 'Low' | 'Medium' | 'High'
  moatAdvantage: string
}

export interface InvestmentMemo {
  moatScore: number
  riskProfile: { regulatory: string; acquisitionFriction: string }
  gpExecutiveSummary: string
}

export interface DealData {
  startupMetadata: StartupMetadata
  competitiveIntel: CompetitorEntry[]
  investmentMemo: InvestmentMemo
}

export type IntakeStatus = 'idle' | 'ingesting' | 'processing' | 'ready' | 'error'
export type InputType = 'file' | 'url' | 'name'
export type ActiveModule = 'ingestion' | 'bento' | 'radar' | 'memo'
