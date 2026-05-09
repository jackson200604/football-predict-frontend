import { motion } from 'framer-motion'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Match, Prediction } from '../types'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  match: Match
  prediction: Prediction
  onClose: () => void
}

const confidenceColor: Record<string, string> = {
  'Élevée': 'text-green-400 bg-green-400/10 border-green-400/30',
  'Moyenne': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  'Faible': 'text-red-400 bg-red-400/10 border-red-400/30'
}

const confidenceBadge: Record<string, string> = {
  'Élevée': 'bg-green-400/20 text-green-400',
  'Moyenne': 'bg-yellow-400/20 text-yellow-400',
  'Faible': 'bg-red-400/20 text-red-400'
}

export default function PredictionModal({ match, prediction, onClose }: Props) {
  const data = {
    labels: [match.homeTeam.name, 'Match nul', match.awayTeam.name],
    datasets: [{
      data: [
        prediction.homeProbability,
        prediction.drawProbability,
        prediction.awayProbability
      ],
      backgroundColor: ['#22d3ee', '#94a3b8', '#6366f1'],
      borderWidth: 0
    }]
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-secondary rounded-2xl p-6 max-w-lg w-full border border-accent my-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-accent">🔮 Prédiction IA</h2>
          <p className="text-slate-400 text-sm mt-1">{match.competition.name}</p>
        </div>

        {/* Équipes + Probabilités */}
        <div className="flex justify-between items-center mb-6 bg-primary rounded-xl p-4">
          <div className="text-center flex-1">
            <p className="font-bold text-sm">{match.homeTeam.name}</p>
            <p className="text-accent text-3xl font-black mt-1">
              {prediction.homeProbability}%
            </p>
          </div>
          <div className="text-center px-2">
            <p className="text-slate-400 text-xs">Nul</p>
            <p className="text-slate-300 text-xl font-bold">
              {prediction.drawProbability}%
            </p>
          </div>
          <div className="text-center flex-1">
            <p className="font-bold text-sm">{match.awayTeam.name}</p>
            <p className="text-indigo-400 text-3xl font-black mt-1">
              {prediction.awayProbability}%
            </p>
          </div>
        </div>

        {/* Graphique */}
        <div className="w-44 mx-auto mb-6">
          <Doughnut data={data} options={{ plugins: { legend: { display: false } } }} />
        </div>

        {/* Résultat */}
        <div className="bg-primary rounded-xl p-4 text-center mb-4">
          <p className="text-slate-400 text-sm mb-1">Prédiction Mistral IA</p>
          <p className="text-accent font-black text-xl mb-2">
            🏆 {prediction.prediction}
          </p>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${confidenceColor[prediction.confidence]}`}>
            Confiance : {prediction.confidence}
          </span>
        </div>

        {/* Analyse */}
        {prediction.reasons.length > 0 && (
          <div className="mb-4">
            <p className="text-accent font-semibold mb-2">📊 Analyse</p>
            <div className="space-y-2">
              {prediction.reasons.map((reason, i) => (
                <div
                  key={i}
                  className="bg-primary rounded-lg p-3 text-sm text-slate-300"
                >
                  {reason}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommandations de paris */}
        {prediction.bettingRecommendations?.length > 0 && (
          <div className="mb-4">
            <p className="text-accent font-semibold mb-2">🎯 Recommandations de Paris</p>
            <div className="space-y-3">
              {prediction.bettingRecommendations.map((bet, i) => (
                <div
                  key={i}
                  className="bg-primary rounded-xl p-4 border border-slate-700"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-slate-400 text-xs">{bet.market}</p>
                      <p className="font-bold text-white">{bet.pick}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-accent font-black text-lg">{bet.odds}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${confidenceBadge[bet.confidence] || 'bg-slate-700 text-slate-300'}`}>
                        {bet.confidence}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs">{bet.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actualités */}
        {prediction.homeAnalysis.news.length > 0 && (
          <div className="mb-4">
            <p className="text-accent font-semibold mb-2">
              📰 Actualités {match.homeTeam.name}
            </p>
            {prediction.homeAnalysis.news.slice(0, 2).map((news, i) => (
              <a
                key={i}
                href={news.link}
                target="_blank"
                rel="noreferrer"
                className="block bg-primary rounded-xl p-3 mb-2 hover:border-accent border border-slate-700 transition"
              >
                <p className="text-sm font-semibold">{news.title}</p>
                <p className="text-slate-400 text-xs mt-1">{news.snippet}</p>
              </a>
            ))}
          </div>
        )}

        {prediction.awayAnalysis.news.length > 0 && (
          <div className="mb-6">
            <p className="text-accent font-semibold mb-2">
              📰 Actualités {match.awayTeam.name}
            </p>
            {prediction.awayAnalysis.news.slice(0, 2).map((news, i) => (
              <a
                key={i}
                href={news.link}
                target="_blank"
                rel="noreferrer"
                className="block bg-primary rounded-xl p-3 mb-2 hover:border-accent border border-slate-700 transition"
              >
                <p className="text-sm font-semibold">{news.title}</p>
                <p className="text-slate-400 text-xs mt-1">{news.snippet}</p>
              </a>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3 mb-4">
          <p className="text-yellow-400 text-xs text-center">
            ⚠️ Les recommandations de paris sont fournies à titre informatif uniquement.
            Pariez de manière responsable.
          </p>
        </div>

        {/* Fermer */}
        <button
          onClick={onClose}
          className="w-full border border-slate-600 py-3 rounded-xl hover:border-accent transition font-semibold"
        >
          Fermer
        </button>
      </motion.div>
    </motion.div>
  )
             }
