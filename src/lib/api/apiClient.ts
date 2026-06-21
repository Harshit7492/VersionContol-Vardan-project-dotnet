import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.API_BASE_URL || 'https://localhost:5000/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient
