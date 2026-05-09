import axios from 'axios'
import { Match, Prediction } from '../types'

const API = axios.create({
  baseURL: 'https://football-predict-backend-uapp.onrender.com'
})

export const getMatches = async (): Promise<Match[]> => {
  const response = await API.get('/matches')
  return response.data.matches
}

export const getPrediction = async (
  homeId: number,
  awayId: number,
  homeTeam: string,
  awayTeam: string
): Promise<Prediction> => {
  const response = await API.get(`/predictions/${homeId}/${awayId}`, {
    params: { homeTeam, awayTeam }
  })
  return response.data.prediction
}
