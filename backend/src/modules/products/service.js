const prisma = require('../prisma')

const productService = {
  async list(params = {}) {
    const { category, keyword } = params
    const where = {}
    if (category) where.category = category
    if (keyword) where.name = { contains: keyword }
    return prisma.product.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        _count: { select: { stockItems: true } }
      }
    })
  },

  async get(id) {
    return prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        stockItems: { orderBy: { expiryDate: 'asc' } }
      }
    })
  },

  async create(data) {
    return prisma.product.create({ data })
  },

  async update(id, data) {
    return prisma.product.update({
      where: { id: Number(id) },
      data
    })
  },

  async remove(id) {
    const tx = await prisma.$transaction(async (tx) => {
      await tx.transaction.deleteMany({ where: { productId: Number(id) } })
      await tx.stockItem.deleteMany({ where: { productId: Number(id) } })
      await tx.product.delete({ where: { id: Number(id) } })
    })
    return { success: true }
  },

  async categories() {
    const products = await prisma.product.findMany({ select: { category: true } })
    return [...new Set(products.map(p => p.category))]
  },

  async stockSummary() {
    const items = await prisma.stockItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      having: { quantity: { _gt: 0 } }
    })
    const productIds = items.map(i => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })
    return items.map(item => {
      const p = products.find(x => x.id === item.productId)
      return {
        productId: item.productId,
        productName: p?.name,
        category: p?.category,
        unit: p?.unit,
        price: p?.price,
        hasExpiry: p?.hasExpiry,
        quantity: item._sum.quantity
      }
    })
  }
}

module.exports = productService
