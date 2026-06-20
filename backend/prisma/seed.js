const { PrismaClient } = require('@prisma/client')
const dayjs = require('dayjs')

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.product.count()
  if (count > 0) {
    console.log('已有数据，跳过种子初始化')
    return
  }

  const products = [
    { name: '尿素 46%', category: '化肥', unit: '袋', price: 120.00, hasExpiry: false },
    { name: '磷酸二铵 64%', category: '化肥', unit: '袋', price: 195.00, hasExpiry: false },
    { name: '复合肥 15-15-15', category: '化肥', unit: '袋', price: 165.00, hasExpiry: false },
    { name: '复合肥 17-17-17', category: '化肥', unit: '袋', price: 185.00, hasExpiry: false },
    { name: '氯化钾 60%', category: '化肥', unit: '袋', price: 210.00, hasExpiry: false },
    { name: '过磷酸钙', category: '化肥', unit: '袋', price: 58.00, hasExpiry: false },
    { name: '有机肥料', category: '化肥', unit: '袋', price: 85.00, hasExpiry: false },

    { name: '草甘膦异丙胺盐 41%', category: '农药', unit: '瓶', price: 35.00, hasExpiry: true },
    { name: '高效氯氟氰菊酯 2.5%', category: '农药', unit: '瓶', price: 28.00, hasExpiry: true },
    { name: '多菌灵 50%', category: '农药', unit: '袋', price: 15.00, hasExpiry: true },
    { name: '吡虫啉 10%', category: '农药', unit: '袋', price: 8.50, hasExpiry: true },
    { name: '阿维菌素 1.8%', category: '农药', unit: '瓶', price: 42.00, hasExpiry: true },
    { name: '代森锰锌 80%', category: '农药', unit: '袋', price: 22.00, hasExpiry: true },
    { name: '戊唑醇 43%', category: '农药', unit: '瓶', price: 65.00, hasExpiry: true },

    { name: '玉米种子 郑单958', category: '种子', unit: '袋', price: 45.00, hasExpiry: true },
    { name: '玉米种子 登海605', category: '种子', unit: '袋', price: 55.00, hasExpiry: true },
    { name: '小麦种子 济麦22', category: '种子', unit: '袋', price: 38.00, hasExpiry: true },
    { name: '花生种子 花育25', category: '种子', unit: '袋', price: 75.00, hasExpiry: true },
    { name: '大豆种子 菏豆12', category: '种子', unit: '袋', price: 68.00, hasExpiry: true },
    { name: '黄瓜种子', category: '种子', unit: '袋', price: 18.00, hasExpiry: true },
    { name: '西红柿种子', category: '种子', unit: '袋', price: 25.00, hasExpiry: true }
  ]

  const created = []
  for (const p of products) {
    const prod = await prisma.product.create({ data: p })
    created.push(prod)
  }

  console.log('已创建商品:', created.length, '个')

  const find = (name) => created.find(p => p.name === name)

  const stockItems = [
    { product: find('尿素 46%'), qty: 50, batchNo: 'NS202501', expiry: null, price: 100.00 },
    { product: find('磷酸二铵 64%'), qty: 35, batchNo: 'LE202502', expiry: null, price: 175.00 },
    { product: find('复合肥 15-15-15'), qty: 8, batchNo: 'FH202412', expiry: null, price: 145.00 },
    { product: find('复合肥 17-17-17'), qty: 42, batchNo: 'FH202503', expiry: null, price: 160.00 },
    { product: find('氯化钾 60%'), qty: 28, batchNo: 'LH202501', expiry: null, price: 188.00 },
    { product: find('过磷酸钙'), qty: 60, batchNo: 'GL202501', expiry: null, price: 48.00 },
    { product: find('有机肥料'), qty: 45, batchNo: 'YJ202502', expiry: null, price: 72.00 },

    { product: find('草甘膦异丙胺盐 41%'), qty: 30, batchNo: 'CG202406', expiry: dayjs().add(20, 'day').toDate(), price: 28.00 },
    { product: find('草甘膦异丙胺盐 41%'), qty: 25, batchNo: 'CG202503', expiry: dayjs().add(500, 'day').toDate(), price: 28.00 },
    { product: find('高效氯氟氰菊酯 2.5%'), qty: 3, batchNo: 'XL202309', expiry: dayjs().subtract(5, 'day').toDate(), price: 22.00 },
    { product: find('高效氯氟氰菊酯 2.5%'), qty: 35, batchNo: 'XL202501', expiry: dayjs().add(600, 'day').toDate(), price: 22.00 },
    { product: find('多菌灵 50%'), qty: 80, batchNo: 'DJ202411', expiry: dayjs().add(180, 'day').toDate(), price: 12.00 },
    { product: find('吡虫啉 10%'), qty: 120, batchNo: 'BC202408', expiry: dayjs().add(45, 'day').toDate(), price: 6.50 },
    { product: find('阿维菌素 1.8%'), qty: 18, batchNo: 'AW202502', expiry: dayjs().add(400, 'day').toDate(), price: 35.00 },
    { product: find('代森锰锌 80%'), qty: 55, batchNo: 'DS202410', expiry: dayjs().add(240, 'day').toDate(), price: 18.00 },
    { product: find('戊唑醇 43%'), qty: 22, batchNo: 'WZ202409', expiry: dayjs().add(60, 'day').toDate(), price: 52.00 },

    { product: find('玉米种子 郑单958'), qty: 30, batchNo: 'ZM2025A', expiry: dayjs().add(300, 'day').toDate(), price: 38.00 },
    { product: find('玉米种子 登海605'), qty: 25, batchNo: 'ZM2025B', expiry: dayjs().add(300, 'day').toDate(), price: 46.00 },
    { product: find('小麦种子 济麦22'), qty: 15, batchNo: 'XM2024A', expiry: dayjs().add(90, 'day').toDate(), price: 32.00 },
    { product: find('花生种子 花育25'), qty: 18, batchNo: 'HS2025A', expiry: dayjs().add(200, 'day').toDate(), price: 62.00 },
    { product: find('大豆种子 菏豆12'), qty: 20, batchNo: 'DD2025A', expiry: dayjs().add(200, 'day').toDate(), price: 55.00 },
    { product: find('黄瓜种子'), qty: 50, batchNo: 'HG2025A', expiry: dayjs().add(360, 'day').toDate(), price: 14.00 },
    { product: find('西红柿种子'), qty: 40, batchNo: 'FS2025A', expiry: dayjs().add(360, 'day').toDate(), price: 20.00 }
  ]

  for (const s of stockItems) {
    if (!s.product) continue
    const item = await prisma.stockItem.create({
      data: {
        productId: s.product.id,
        quantity: s.qty,
        batchNo: s.batchNo,
        expiryDate: s.expiry,
        purchasePrice: s.price
      }
    })

    await prisma.transaction.create({
      data: {
        type: 'IN',
        productId: s.product.id,
        stockItemId: item.id,
        quantity: s.qty,
        unitPrice: s.price,
        totalPrice: s.price * s.qty,
        remark: '初始库存',
        operator: '系统初始化'
      }
    })
  }

  const sampleOut = [
    { product: find('尿素 46%'), qty: 5, price: 120.00 },
    { product: find('复合肥 15-15-15'), qty: 10, price: 165.00 },
    { product: find('草甘膦异丙胺盐 41%'), qty: 8, price: 35.00 },
    { product: find('吡虫啉 10%'), qty: 20, price: 8.50 },
    { product: find('玉米种子 郑单958'), qty: 5, price: 45.00 }
  ]

  for (const o of sampleOut) {
    if (!o.product) continue
    await prisma.transaction.create({
      data: {
        type: 'OUT',
        productId: o.product.id,
        quantity: o.qty,
        unitPrice: o.price,
        totalPrice: o.price * o.qty,
        remark: '示例销售',
        operator: '示例'
      }
    })

    const items = await prisma.stockItem.findMany({
      where: { productId: o.product.id, quantity: { gt: 0 } },
      orderBy: { expiryDate: 'asc' }
    })
    let remaining = o.qty
    for (const it of items) {
      if (remaining <= 0) break
      const take = Math.min(it.quantity, remaining)
      await prisma.stockItem.update({
        where: { id: it.id },
        data: { quantity: it.quantity - take }
      })
      remaining -= take
    }
  }

  console.log('种子数据初始化完成！')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
