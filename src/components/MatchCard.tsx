import { motion } from 'framer-motion'
import { Match } from '../types'

interface Props {
  match: Match
  index: number
  onPredict: (match: Match) => void
  loading: boolean
}

export default function MatchCard({ match, index, onPredict, loading }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-secondary rounded-2xl p-6 border border-slate-700 hover:border-accent transition-all duration-300"
    >
      {/* Compétition */}
      <p className="text-accent text-sm font-semibold mb-4 uppercase tracking-wider">
        🏆 {match.competition.name}
      </p>

      {/* Équipes */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-center flex-1">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-xl">🏠</span>
          </div>
          <p className="font-bold text-sm">{match.homeTeam.name}</p>
          <p className="text-slate-400 text-xs mt-1">Domicile</p>
        </div>

        <div className="flex flex-col items-center px-4">
          <p className="text-accent font-black text-2xl">VS</p>
        </div>

        <div className="text-center flex-1">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-xl">✈️</span>
          </div>
          <p className="font-bold text-sm">{match.awayTeam.name}</p>
          <p className="text-slate-400 text-xs mt-1">Extérieur</p>
        </div>
      </div>

      {/* Date */}
      <p className="text-slate-400 text-xs text-center mb-4">
        📅 {new Date(match.utcDate).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>

      {/* Bouton */}
      <button
        onClick={() => onPredict(match)}
        disabled={loading}
        className="w-full bg-accent text-primary font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '⏳ Analyse en cours...' : '🔮 Voir la prédiction IA'}
      </button>
    </motion.div>
  )
        }
