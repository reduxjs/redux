import axios from 'axios'

const api = axios.create({
  headers: {Accept: 'application/json'},
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['authorization'] = `Bearer ${token}`
  }
  return config
})

export default api
