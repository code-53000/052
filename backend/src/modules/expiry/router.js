const express = require('express')
const expiryService = require('./service')

const router = express.Router()

router.get('/warning', async (req, res) => {
  try {
    const days = req.query.days ? Number(req.query.days) : 30
    const data = await expiryService.getWarning(days)
    res.json({ success: true, data })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
})

module.exports = router
