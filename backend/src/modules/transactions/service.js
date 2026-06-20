const prisma = require('../../prisma')
const dayjs = require('dayjs')

const transactionService = {
  async list(params = {}) {
    const { type, productId, dateFrom, dateTo, operator } = params
    const where = {}
    if (type) where.type = type
    if (productId) where.productId = Number(productId)
    if (operator) where.operator = operator
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = dayjs(dateTo).endOf('day').toDate()
    }

    const data = await prisma.transaction.findMany({
      where,
      include: { product: true },
      orderBy: { id: 'desc' },
      take: 500
    })
    return data
  },

  async dailySummary(date) {
    const start = dayjs(date || undefined).startOf('day').toDate()
    const end = dayjs(date || undefined).endOf('day').toDate()

    const items = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: start, lte: end }
      },
      include: { product: true }
    })

    const inTotal = items.filter(t => t.type === 'IN').reduce((s, t) => s + t.totalPrice.toNumber(), 0)
    const outTotal = items.filter(t => t.type === 'OUT').reduce((s, t) => s + t.totalPrice.toNumber(), 0)
    const inCount = items.filter(t => t.type === 'IN').length
    const outCount = items.filter(t => t.type === 'OUT').length

    return {
      date: dayjs(start).format('YYYY-MM-DD'),
      inTotal,
      outTotal,
      inCount,
      outCount,
      items
    }
  }
}

module.exports = transactionService
