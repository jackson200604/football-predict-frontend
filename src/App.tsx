import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getMatches, getPrediction } from './api/football'
import { Match, Prediction } from './types'
import MatchCard from './components/MatchCard'
import PredictionModal from './components/PredictionModal'
import Loader from './components/Loader'

// Types pour une meilleure gestion d'état
type AppState = 
  | { status: 'loading' }
  | { status: 'idle'; matches: Match[] }
  | { status: 'error'; error: string; matches: Match[] }

type PredictionState = 
  | { status: 'idle' }
  | { status: 'predicting'; matchId: number }
  | { status: 'success'; match: Match; prediction: Prediction }
  | { status: 'error'; error: string; matchId: number }

const TIMEOUT_MS = 10000 // 10 secondes timeout
const MAX_RETRIES = 2
const API_ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Erreur réseau. Vérifiez votre connexion.',
  TIMEOUT: 'Requête timeout. Le serveur ne répond pas.',
  SERVER_ERROR: 'Erreur serveur. Réessayez plus tard.',
  UNKNOWN: 'Une erreur inattendue s\'est produite.'
}

export default function App() {
  const [appState, setAppState] = useState<AppState>({ status: 'loading' })
  const [predictionState, setPredictionState] = useState<PredictionState>({ status: 'idle' })
  
  // Refs pour cleanup
  const mountedRef = useRef(true)
  const abortControllerRef = useRef<AbortController | null>(null)
  const retryCountRef = useRef(0)

  // Fetch matches avec retry et timeout
  useEffect(() => {
    const fetchMatches = async () => {
      abortControllerRef.current = new AbortController()
      
      try {
        const timeoutId = setTimeout(
          () => abortControllerRef.current?.abort(),
          TIMEOUT_MS
        )
        
        const data = await getMatches()
        clearTimeout(timeoutId)
        
        if (mountedRef.current) {
          setAppState({ status: 'idle', matches: data })
          retryCountRef.current = 0
        }
      } catch (err) {
        clearTimeout(undefined)
        
        if (!mountedRef.current) return
        
        const errorMessage = getErrorMessage(err)
        
        // Retry logic
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++
          setTimeout(fetchMatches, 2000 * retryCountRef.current) // Exponential backoff
        } else {
          setAppState({ 
            status: 'error', 
            error: errorMessage,
            matches: []
          })
        }
      }
    }

    fetchMatches()

    return () => {
      mountedRef.current = false
      abortControllerRef.current?.abort()
    }
  }, [])

  // Callback pour prédiction avec memoization
  const handlePredict = useCallback(async (match: Match) => {
    if (predictionState.status !== 'idle') return // Évite les clics multiples
    
    setPredictionState({ status: 'predicting', matchId: match.id })
    
    try {
      const result = await getPrediction(
        match.homeTeam.id,
        match.awayTeam.id,
        match.homeTeam.name,
        match.awayTeam.name
      )
      
      if (mountedRef.current) {
        setPredictionState({ 
          status: 'success', 
          match, 
          prediction: result 
        })
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = getErrorMessage(err)
        setPredictionState({ 
          status: 'error', 
          error: errorMessage, 
          matchId: match.id 
        })
      }
    }
  }, [predictionState])

  const handleCloseModal = useCallback(() => {
    setPredictionState({ status: 'idle' })
  }, [])

  const handleRetry = useCallback(() => {
    retryCountRef.current = 0
    setAppState({ status: 'loading' })
    
    const fetchMatches = async () => {
      try {
        const data = await getMatches()
        if (mountedRef.current) {
          setAppState({ status: 'idle', matches: data })
        }
      } catch (err) {
        if (mountedRef.current) {
          setAppState({ 
            status: 'error', 
            error: getErrorMessage(err),
            matches: []
          })
        }
      }
    }
    fetchMatches()
  }, [])

  const handleDismissError = useCallback(() => {
    if (appState.status === 'error') {
      setAppState({ status: 'idle', matches: appState.matches })
    }
  }, [appState])

  // Rendu
  const matches = appState.status !== 'loading' ? appState.matches : []
  const errorMessage = appState.status === 'error' ? appState.error : null

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-black text-accent mb-3">
          Football Predictions
        </h1>
        <p className="text-slate-400 text-lg">
          Stats - Actualites - H2H
        </p>
      </motion.div>

      {/* Error Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-900/30 border border-red-500 rounded-xl p-4 mb-6"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-red-400 font-semibold mb-1">Erreur</p>
                <p className="text-red-300 text-sm break-all">{errorMessage}</p>
              </div>
              <button
                onClick={handleDismissError}
                className="text-red-400 ml-2 hover:text-red-300 transition"
                aria-label="Fermer l'erreur"
              >
                ✕
              </button>
            </div>
            {appState.status === 'error' && (
              <button
                onClick={handleRetry}
                className="text-red-400 text-xs mt-3 underline hover:text-red-300 transition"
              >
                ↻ Réessayer
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      <AnimatePresence>
        {appState.status === 'loading' && <Loader />}
      </AnimatePresence>

      {/* Empty state */}
      {appState.status !== 'loading' && matches.length === 0 && (
        <div className="text-center text-slate-400 mt-20">
          <p className="text-6xl mb-4">⚽</p>
          <p className="text-xl">Aucun match disponible</p>
        </div>
      )}

      {/* Matches grid */}
      {appState.status !== 'loading' && matches.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-slate-400 mb-6 font-semibold">
            {matches.length} match{matches.length > 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, i) => (
              <MatchCard
                key={match.id}
                match={match}
                index={i}
                onPredict={handlePredict}
                loading={predictionState.status === 'predicting' && predictionState.matchId === match.id}
                isDisabled={predictionState.status === 'predicting' && predictionState.matchId !== match.id}
                error={predictionState.status === 'error' && predictionState.matchId === match.id ? predictionState.error : null}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Prediction Modal */}
      <AnimatePresence>
        {predictionState.status === 'success' && (
          <PredictionModal
            match={predictionState.match}
            prediction={predictionState.prediction}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Utilitaire de gestion d'erreurs
function getErrorMessage(err: unknown): string {
  if (err instanceof AbortError) {
    return API_ERROR_MESSAGES.TIMEOUT
  }
  
  if (err instanceof TypeError) {
    return API_ERROR_MESSAGES.NETWORK_ERROR
  }

  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as any).response
    if (response?.status >= 500) {
      return API_ERROR_MESSAGES.SERVER_ERROR
    }
    return response?.data?.error || response?.data?.message || API_ERROR_MESSAGES.UNKNOWN
  }

  if (err instanceof Error) {
    return err.message
  }

  return API_ERROR_MESSAGES.UNKNOWN
      }
