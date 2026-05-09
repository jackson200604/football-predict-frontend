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

  const confidenceColor = {
    'Élevée': 'text-green-400',
    'Moyenne': 'text-yellow-400',
    'Faible': 'text-red-400'
  }[prediction.confidence] || 'text-slate-400'

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
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-secondary rounded-2xl p-6 max-w-lg w-full border border-accent my-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-accent">🔮 Prédiction IA</h2>
          <p className="text-slate-400 text-sm mt-1">{match.competition.name}</p>
        </div>

        {/* Équipes */}
        <div className="flex justify-between items-center mb-6 bg-primary rounded-xl p-4">
          <div className="text-center flex-1">
            <p className="font-bold">{match.homeTeam.name}</p>
            <p className="text-accent text-2xl font-black mt-1">
              {prediction.homeProbability}%
            </p>
          </div>
          <div className="text-center px-4">
            <p className="text-slate-400 text-sm">Nul</p>
            <p className="text-slate-300 text-xl font-bold">
              {prediction.drawProbability}%
            </p>
          </div>
          <div className="text-center flex-1">
            <p className="font-bold">{match.awayTeam.name}</p>
            <p className="text-indigo-400 text-2xl font-black mt-1">
              {prediction.awayProbability}%
            </p>
          </div>
        </div>

        {/* Graphique */}
        <div className="w-48 mx-auto mb-6">
          <Doughnut data={data} options={{ plugins: { legend: { display: false } } }} />
        </div>

        {/* Résultat */}
        <div className="bg-primary rounded-xl p-4 text-center mb-4">
          <p className="text-slate-400 text-sm mb-1">Prédiction</p>
          <p className="text-accent font-black text-xl">
            🏆 {prediction.prediction}
          </p>
          <p className={`text-sm mt-1 font-semibold ${confidenceColor}`}>
            Confiance : {prediction.confidence}
          </p>
        </div>

        {/* Raisons */}
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
