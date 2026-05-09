import { motion } from 'framer-motion'

export default function Loader() {
  return (
    <div className="flex flex-col justify-center items-center h-64 gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full"
      />
      <p className="text-slate-400 text-sm">Chargement des matchs...</p>
    </div>
  )
}
