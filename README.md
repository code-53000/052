# 农资店进销存系统

给镇上农资夫妻店用的简单进销存系统，两三个人用刚好。管商品、管出入库、看库存、盯保质期、拉流水。

## 功能

- **商品管理**：化肥、农药、种子分类管理，可设置是否需要管理保质期
- **出入库**：入库填批号、进价、保质期；出库自动按先过期先出的原则扣减
- **实时库存**：首页就能看到每款货剩多少，库存不足自动标红
- **保质期预警**：农药、种子临期在首页提醒，可按 7/30/90/365 天筛选
- **流水记录**：按日期、类型、商品、操作员筛选，可导出 CSV

## 技术栈

- 后端：Node.js + Express + Prisma + MySQL
- 前端：Vue 3 + Vite + Element Plus
- 部署：Docker Compose

## 启动

```bash
docker-compose up -d
```

第一次启动会自动建表并灌入常见化肥农药种子的示例数据，稍等一两分钟后：

- 前端：http://localhost:5173
- 后端：http://localhost:3000/api/health

## 目录结构

```
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── products/      # 商品管理
│   │   │   ├── inventory/     # 库存出入库
│   │   │   ├── expiry/        # 保质期预警
│   │   │   └── transactions/  # 流水记录
│   │   └── index.js
│   └── prisma/
│       ├── schema.prisma
│       └── seed.js            # 示例数据
├── frontend/
│   └── src/
│       ├── views/             # 5个页面
│       ├── api/               # 接口封装
│       └── router/
└── docker-compose.yml
```

## 模块说明

每个业务模块都分 `service.js`（业务逻辑）和 `router.js`（接口），后面想加供货商往来账、会员啥的，照着加个目录就行，不会和现有代码搅在一起。
