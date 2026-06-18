import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react'
import type { DealData, IntakeStatus, ActiveModule, InputType } from '../types'

interface CopilotState {
  activeModule: ActiveModule
  intakeStatus: IntakeStatus
  dealData: DealData | null
  error: string | null
}

type CopilotAction =
  | { type: 'SET_MODULE'; payload: ActiveModule }
  | { type: 'INTAKE_START' }
  | { type: 'INTAKE_PROCESSING' }
  | { type: 'INTAKE_SUCCESS'; payload: DealData }
  | { type: 'INTAKE_ERROR'; payload: string }
  | { type: 'RESET' }

const initialState: CopilotState = {
  activeModule: 'ingestion',
  intakeStatus: 'idle',
  dealData: null,
  error: null,
}

function reducer(state: CopilotState, action: CopilotAction): CopilotState {
  switch (action.type) {
    case 'SET_MODULE':        return { ...state, activeModule: action.payload }
    case 'INTAKE_START':      return { ...state, intakeStatus: 'ingesting', error: null }
    case 'INTAKE_PROCESSING': return { ...state, intakeStatus: 'processing' }
    case 'INTAKE_SUCCESS':    return { ...state, intakeStatus: 'ready', dealData: action.payload }
    case 'INTAKE_ERROR':      return { ...state, intakeStatus: 'error', error: action.payload }
    case 'RESET':             return { ...state, intakeStatus: 'idle', dealData: null, error: null }
    default:                  return state
  }
}

interface CopilotContextValue extends CopilotState {
  setActiveModule: (module: ActiveModule) => void
  ingest: (input: string, type: InputType) => Promise<void>
  reset: () => void
}

const CopilotContext = createContext<CopilotContextValue | null>(null)

export function CopilotProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setActiveModule = useCallback((module: ActiveModule) => {
    dispatch({ type: 'SET_MODULE', payload: module })
  }, [])

  const ingest = useCallback(async (input: string, type: InputType) => {
    // Immediately enter ingesting state so terminal animation starts
    dispatch({ type: 'INTAKE_START' })

    // Switch to processing phase at 1.5s — midway through the backend's 3.5s simulation.
    // This drives the second wave of terminal lines before the response arrives.
    const processingTimer = setTimeout(
      () => dispatch({ type: 'INTAKE_PROCESSING' }),
      1500
    )

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, type }),
      })
      clearTimeout(processingTimer)
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const json = (await res.json()) as { message: string; data: DealData | null }
      if (json.data) {
        dispatch({ type: 'INTAKE_SUCCESS', payload: json.data })
      } else {
        dispatch({ type: 'INTAKE_ERROR', payload: json.message ?? 'No data returned from analysis engine' })
      }
    } catch (err) {
      clearTimeout(processingTimer)
      dispatch({ type: 'INTAKE_ERROR', payload: err instanceof Error ? err.message : 'Unknown error' })
    }
  }, [])

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  return (
    <CopilotContext.Provider value={{ ...state, setActiveModule, ingest, reset }}>
      {children}
    </CopilotContext.Provider>
  )
}

export function useCopilot(): CopilotContextValue {
  const ctx = useContext(CopilotContext)
  if (!ctx) throw new Error('useCopilot must be used within CopilotProvider')
  return ctx
}

export const useActiveModule = (): ActiveModule    => useCopilot().activeModule
export const useDealData     = (): DealData | null => useCopilot().dealData
export const useIntakeStatus = (): IntakeStatus    => useCopilot().intakeStatus
