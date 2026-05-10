import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMatches, getPrediction } from './api/football'
import { Match, Prediction } from './types'
import MatchCard from './components/MatchCard'
import PredictionModal from './components/PredictionModal'
import Loader from './components/Loader'

export default function App() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState<number | null>(null)
  const [selected, setSelected] = useState<Match | null>(null)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMatches()
      .then(data => setMatches(data))
      .catch(() => setError('Impossible de charger les matchs'))
      .finally(() => setLoading(false))
  }, [])

  const handlePredict = async (match: Match) => {
    setPredicting(match.id)
    setSelected(match)
    setError(null)
    try {
      const result = await getPrediction(
        match.homeTeam.id,
        match.awayTeam.id,
        match.homeTeam.name,
        match.awayTeam.name
      )
      setPrediction(result)
    } catch (err: any) {
      const data = err?.response?.data
      const message = data?.error
        || data?.message
        || err?.message
        || 'Erreur inconnue'
      const details = data?.details
      setError(details
        ? message + ' — Service: ' + details.service + ' (HTTP ' + details.status + ')'
        : message
      )
      setSelected(null)
    } finally {
      setPredicting(null)
    }
  }

  const handleClose = () => {
    setSelected(null)
    setPrediction(null)
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-black text-accent mb-3">
          ⚽ Football Predictions
        </h1>
        <p className="text-slate-400 text-lg">
          Prédictions alimentées par l'IA — Stats • Actualités • H2H
        </p>
      </motion.div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 rounded-xl p-4 mb-6">
          <p className="text-red-400 font-semibold mb-1">❌ Erreur détaillée</p>
          <p className="text-red-300 text-sm break-all">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 text-xs mt-2 underline"
          >
            Fermer
          </button>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : matches.length === 0 ? (
        <div className="text-center text-slate-400 mt-20">
          <p className="text-6xl mb-4">⚽</p>
          <p className="text-xl">Aucun match disponible</p>
        </div>
      ) : (
        <>
          <p className="text-slate-400 mb-6">{matches.length} matchs</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, i) => (
              <MatchCard
                key={match.id}
                match={match}
                index={i}
                onPredict={handlePredict}
                loading={predicting === match.id}
              />
            ))}
          </div>
        </>
      )}

      {selected && prediction && (
        <PredictionModal
          match={selected}
          prediction={prediction}
          onClose={handleClose}
        />
      )}
    </div>
  )
    }            {matches.length} matchs disponibles
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, i) => (
              <MatchCard
                key={match.id}
                match={match}
                index={i}
                onPredict={handlePredict}
                loading={predicting === match.id}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {selected && prediction && (
        <PredictionModal
          match={selected}
          prediction={prediction}
          onClose={handleClose}
        />
      )}
    </div>
  )
         }
