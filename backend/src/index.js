const express = require('express')
const cors = require('cors')

const productsRouter = require('./modules/products/router')
const inventoryRouter = require('./modules/inventory/router')
const expiryRouter = require('./modules/expiry/router')
const transactionsRouter = require('./modules/transactions/router')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '农资店进销存系统运行正常' })
})

app.use('/api/products', productsRouter)
app.use('/api/inventory', inventoryRouter)
app.use('/api/expiry', expiryRouter)
app.use('/api/transactions', transactionsRouter)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ success: false, message: err.message || '服务器错误' })
})

app.listen(PORT, () => {
  console.log(`农资店进销存系统后端已启动: http://localhost:${PORT}`)
})
