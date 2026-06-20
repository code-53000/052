const express = require('express')
const productService = require('./service')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const data = await productService.list(req.query)
    res.json({ success: true, data })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
})

router.get('/categories', async (req, res) => {
  try {
    const data = await productService.categories()
    res.json({ success: true, data })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
})

router.get('/stock-summary', async (req, res) => {
  try {
    const data = await productService.stockSummary()
    res.json({ success: true, data })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const data = await productService.get(req.params.id)
    res.json({ success: true, data })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const data = await productService.create(req.body)
    res.json({ success: true, data })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const data = await productService.update(req.params.id, req.body)
    res.json({ success: true, data })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const data = await productService.remove(req.params.id)
    res.json({ success: true, data })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
})

module.exports = router
