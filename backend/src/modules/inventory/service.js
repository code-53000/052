const prisma = require('../../prisma')

const inventoryService = {
  async stockIn(data) {
    const { productId, quantity, batchNo, expiryDate, purchasePrice, remark, operator } = data

    const result = await prisma.$transaction(async (tx) => {
      const stockItem = await tx.stockItem.create({
        data: {
          productId: Number(productId),
          quantity: Number(quantity),
          batchNo: batchNo || null,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          purchasePrice: parseFloat(purchasePrice),
          inDate: new Date()
        }
      })

      const product = await tx.product.findUnique({ where: { id: Number(productId) } })

      const transaction = await tx.transaction.create({
        data: {
          type: 'IN',
          productId: Number(productId),
          stockItemId: stockItem.id,
          quantity: Number(quantity),
          unitPrice: parseFloat(purchasePrice),
          totalPrice: parseFloat(purchasePrice) * Number(quantity),
          remark: remark || null,
          operator: operator || '系统'
        }
      })

      return { stockItem, transaction, product }
    })

    return result
  },

  async stockOut(data) {
    const { productId, quantity, unitPrice, remark, operator } = data
    const qty = Number(quantity)

    const result = await prisma.$transaction(async (tx) => {
      const stockItems = await tx.stockItem.findMany({
        where: { productId: Number(productId), quantity: { gt: 0 } },
        orderBy: { expiryDate: 'asc' }
      })

      let totalStock = stockItems.reduce((s, i) => s + i.quantity, 0)
      if (totalStock < qty) {
        throw new Error('库存不足，当前库存：' + totalStock)
      }

      let remaining = qty
      const affectedItems = []

      for (const item of stockItems) {
        if (remaining <= 0) break
        const take = Math.min(item.quantity, remaining)
        await tx.stockItem.update({
          where: { id: item.id },
          data: { quantity: item.quantity - take }
        })
        affectedItems.push({ id: item.id, take })
        remaining -= take
      }

      const product = await tx.product.findUnique({ where: { id: Number(productId) } })
      const price = unitPrice ? parseFloat(unitPrice) : product?.price?.toNumber() || 0

      const transaction = await tx.transaction.create({
        data: {
          type: 'OUT',
          productId: Number(productId),
          stockItemId: affectedItems[0]?.id || null,
          quantity: qty,
          unitPrice: price,
          totalPrice: price * qty,
          remark: remark || null,
          operator: operator || '系统'
        }
      })

      return { transaction, product }
    })

    return result
  },

  async getProductStock(productId) {
    const items = await prisma.stockItem.findMany({
      where: { productId: Number(productId), quantity: { gt: 0 } },
      orderBy: { expiryDate: 'asc' }
    })
    const total = items.reduce((s, i) => s + i.quantity, 0)
    return { total, items }
  },

  async listStockItems(params = {}) {
    const { productId, hasExpiry } = params
    const where = { quantity: { gt: 0 } }
    if (productId) where.productId = Number(productId)
    if (hasExpiry !== undefined) {
      where.product = { hasExpiry: hasExpiry === 'true' }
    }
    return prisma.stockItem.findMany({
      where,
      include: { product: true },
      orderBy: { id: 'desc' }
    })
  }
}

module.exports = inventoryService
