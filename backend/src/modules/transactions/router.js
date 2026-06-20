const express = require('express')
const transactionService = require('./service')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const data = await transactionService.list(req.query)
    res.json({ success: true, data })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
})

router.get('/daily', async (req, res) => {
  try {
    const data = await transactionService.dailySummary(req.query.date)
    res.json({ success: true, data })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
})

module.exports = router
