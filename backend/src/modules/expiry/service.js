const prisma = require('../prisma')
const dayjs = require('dayjs')

const expiryService = {
  async getWarning(daysAhead = 30) {
    const now = new Date()
    const warningDate = dayjs().add(daysAhead, 'day').toDate()

    const items = await prisma.stockItem.findMany({
      where: {
        quantity: { gt: 0 },
        product: { hasExpiry: true },
        expiryDate: {
          not: null,
          lte: warningDate
        }
      },
      include: { product: true },
      orderBy: { expiryDate: 'asc' }
    })

    return items.map(item => {
      const daysLeft = dayjs(item.expiryDate).diff(dayjs(), 'day')
      let level = 'normal'
      if (daysLeft <= 0) level = 'expired'
      else if (daysLeft <= 7) level = 'urgent'
      else if (daysLeft <= 30) level = 'warning'
      return {
        ...item,
        daysLeft,
        level
      }
    })
  }
}

module.exports = expiryService
