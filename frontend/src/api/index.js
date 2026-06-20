import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.response.use(
  (res) => {
    if (res.data && res.data.success === false) {
      return Promise.reject(new Error(res.data.message || '请求失败'))
    }
    return res.data
  },
  (err) => Promise.reject(err)
)

export const productApi = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
  categories: () => api.get('/products/categories'),
  stockSummary: () => api.get('/products/stock-summary')
}

export const inventoryApi = {
  stockIn: (data) => api.post('/inventory/in', data),
  stockOut: (data) => api.post('/inventory/out', data),
  getStock: (productId) => api.get(`/inventory/${productId}`),
  stockItems: (params) => api.get('/inventory/stock-items', { params })
}

export const expiryApi = {
  warning: (days = 30) => api.get('/expiry/warning', { params: { days } })
}

export const transactionApi = {
  list: (params) => api.get('/transactions', { params }),
  daily: (date) => api.get('/transactions/daily', { params: { date } })
}

export default api
