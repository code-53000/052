<template>
  <div>
    <div class="page-title">
      <span>首页概览</span>
      <span style="font-size:14px;color:#909399;font-weight:normal;">
        {{ today }}
      </span>
    </div>

    <el-row :gutter="16" style="margin-bottom:16px;">
      <el-col :span="6">
        <div class="stat-card" style="background:linear-gradient(135deg,#67C23A,#85ce61);">
          <div class="stat-label">商品种类</div>
          <div class="stat-value">{{ stats.productCount }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="background:linear-gradient(135deg,#409EFF,#79bbff);">
          <div class="stat-label">今日入库</div>
          <div class="stat-value">{{ stats.inCount }} 笔</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="background:linear-gradient(135deg,#E6A23C,#f0c78a);">
          <div class="stat-label">今日出库</div>
          <div class="stat-value">{{ stats.outCount }} 笔</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="background:linear-gradient(135deg,#F56C6C,#f89898);">
          <div class="stat-label">临期商品</div>
          <div class="stat-value">{{ expiryList.length }} 项</div>
        </div>
      </el-col>
    </el-row>

    <el-alert
      v-if="expiryList.length"
      type="warning"
      :closable="false"
      show-icon
      style="margin-bottom:16px;"
    >
      <template #title>
        <span style="font-weight:bold;">保质期预警</span>
        <span> - 有 {{ expiryList.length }} 项商品临近过期或已过期，请及时处理</span>
        <el-link type="primary" @click="$router.push('/expiry')" style="margin-left:8px;">查看详情</el-link>
      </template>
    </el-alert>

    <el-row :gutter="16">
      <el-col :span="14">
        <div class="card">
          <div class="card-title">
            <span style="font-weight:bold;font-size:16px;">当前库存</span>
            <el-input
              v-model="keyword"
              placeholder="搜索商品"
              size="small"
              style="width:200px;"
              clearable
              :prefix-icon="Search"
            />
          </div>
          <el-table :data="filteredStock" size="small" stripe style="margin-top:12px;">
            <el-table-column prop="productName" label="商品名称" min-width="180" />
            <el-table-column prop="category" label="分类" width="80" align="center" />
            <el-table-column prop="quantity" label="库存" width="100" align="right">
              <template #default="{ row }">
                <el-tag v-if="row.quantity <= 10" type="danger" size="small">
                  {{ row.quantity }} {{ row.unit }}
                </el-tag>
                <span v-else>{{ row.quantity }} {{ row.unit }}</span>
              </template>
            </el-table-column>
            <el-table-column label="售价" width="100" align="right">
              <template #default="{ row }">¥{{ Number(row.price).toFixed(2) }}</template>
            </el-table-column>
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.quantity <= 0" type="info" size="small">缺货</el-tag>
                <el-tag v-else-if="row.quantity <= 10" type="danger" size="small">告急</el-tag>
                <el-tag v-else type="success" size="small">正常</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <el-col :span="10">
        <div class="card">
          <div style="font-weight:bold;font-size:16px;margin-bottom:12px;">保质期预警列表</div>
          <el-table :data="expiryList" size="small" stripe>
            <el-table-column prop="product.name" label="商品名称" min-width="150" />
            <el-table-column prop="batchNo" label="批号" width="100" />
            <el-table-column prop="quantity" label="库存" width="60" align="right" />
            <el-table-column label="剩余天数" width="80" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.level === 'expired'" type="danger" size="small">已过期</el-tag>
                <el-tag v-else-if="row.level === 'urgent'" type="danger" size="small">{{ row.daysLeft }}天</el-tag>
                <el-tag v-else type="warning" size="small">{{ row.daysLeft }}天</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="过期时间" width="110">
              <template #default="{ row }">
                {{ formatDate(row.expiryDate) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { Search } from '@element-plus/icons-vue'
import { productApi, expiryApi, transactionApi } from '../api'

const today = ref(dayjs().format('YYYY年MM月DD日 dddd'))
const stockList = ref([])
const expiryList = ref([])
const keyword = ref('')
const stats = ref({ productCount: 0, inCount: 0, outCount: 0 })

const filteredStock = computed(() => {
  if (!keyword.value) return stockList.value
  return stockList.value.filter(s =>
    s.productName.includes(keyword.value)
  )
})

const formatDate = (d) => d ? dayjs(d).format('YYYY-MM-DD') : '-'

async function loadAll() {
  const [stockRes, expiryRes, dailyRes] = await Promise.allSettled([
    productApi.stockSummary(),
    expiryApi.warning(30),
    transactionApi.daily()
  ])
  if (stockRes.status === 'fulfilled') {
    stockList.value = stockRes.value.data
    stats.value.productCount = stockList.value.length
  }
  if (expiryRes.status === 'fulfilled') {
    expiryList.value = expiryRes.value.data
  }
  if (dailyRes.status === 'fulfilled') {
    stats.value.inCount = dailyRes.value.data.inCount
    stats.value.outCount = dailyRes.value.data.outCount
  }
}

onMounted(loadAll)
</script>

<style scoped>
.stat-card {
  color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
}
.card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
