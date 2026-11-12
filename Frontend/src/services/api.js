import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('includeclima_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const url = erro.config?.url || ''
    const ehAuth = url.startsWith('/auth/')
    if (erro.response?.status === 401 && !ehAuth) {
      localStorage.removeItem('includeclima_token')
      localStorage.removeItem('includeclima_user')
      window.location.href = '/login'
    }
    return Promise.reject(erro)
  }
)

export default api