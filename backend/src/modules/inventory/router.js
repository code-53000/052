const express = require('express')
const inventoryService = require('./service')

const router = express.Router()

router.get('/stock-items', async (req, res) => {
  try {
    const data = await inventoryService.listStockItems(req.query)
    res.json({ success: true, data })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
})

router.get('/:productId', async (req, res) => {
  try {
    const data = await inventoryService.getProductStock(req.params.productId)
    res.json({ success: true, data })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
})

router.post('/in', async (req, res) => {
  try {
    const data = await inventoryService.stockIn(req.body)
    res.json({ success: true, data })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
})

router.post('/out', async (req, res) => {
  try {
    const data = await inventoryService.stockOut(req.body)
    res.json({ success: true, data })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
})

module.exports = router
