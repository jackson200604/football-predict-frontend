export interface Team {
  id: number
  name: string
}

export interface Competition {
  name: string
}

export interface Match {
  id: number
  homeTeam: Team
  awayTeam: Team
  utcDate: string
  competition: Competition
}

export interface NewsItem {
  title: string
  link: string
  snippet: string
}

export interface TeamStats {
  wins: number
  draws: number
  losses: number
  goalsScored: number
  goalsConceded: number
  form: string[]
  cleanSheets: number
}

export interface H2HStats {
  homeWins: number
  awayWins: number
  draws: number
  totalGames: number
}

export interface NewsAnalysis {
  hasInjuries: boolean
  hasSuspensions: boolean
  injuredPlayers: string[]
  suspendedPlayers: string[]
}

export interface TeamAnalysis {
  stats: TeamStats
  newsAnalysis: NewsAnalysis
  news: NewsItem[]
}

export interface Prediction {
  homeProbability: number
  awayProbability: number
  drawProbability: number
  prediction: string
  confidence: string
  reasons: string[]
  homeAnalysis: TeamAnalysis
  awayAnalysis: TeamAnalysis
  h2h: H2HStats
  }
