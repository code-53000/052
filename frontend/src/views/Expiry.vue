<template>
  <div>
    <div class="page-title">
      <span>保质期预警</span>
      <el-radio-group v-model="daysAhead" size="default" @change="loadList">
        <el-radio-button :label="7">7天内</el-radio-button>
        <el-radio-button :label="30">30天内</el-radio-button>
        <el-radio-button :label="90">90天内</el-radio-button>
        <el-radio-button :label="365">1年内</el-radio-button>
      </el-radio-group>
    </div>

    <el-row :gutter="16" style="margin-bottom:16px;">
      <el-col :span="6">
        <div class="warn-card expired">
          <div class="label">已过期</div>
          <div class="value">{{ counts.expired }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="warn-card urgent">
          <div class="label">7天内过期</div>
          <div class="value">{{ counts.urgent }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="warn-card warning">
          <div class="label">30天内过期</div>
          <div class="value">{{ counts.warning }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="warn-card normal">
          <div class="label">30天以上</div>
          <div class="value">{{ counts.normal }}</div>
        </div>
      </el-col>
    </el-row>

    <div class="card">
      <el-alert
        v-if="counts.expired > 0"
        type="error"
        :closable="false"
        show-icon
        style="margin-bottom:12px;"
        title="注意：有已过期商品，请立即下架处理，严禁销售！"
      />
      <el-table :data="list" stripe>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.level === 'expired'" type="danger" effect="dark" size="small">已过期</el-tag>
            <el-tag v-else-if="row.level === 'urgent'" type="danger" size="small">紧急</el-tag>
            <el-tag v-else-if="row.level === 'warning'" type="warning" size="small">警告</el-tag>
            <el-tag v-else type="success" size="small">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="product.name" label="商品名称" min-width="200" />
        <el-table-column prop="product.category" label="分类" width="80" align="center" />
        <el-table-column prop="batchNo" label="批号" width="120" />
        <el-table-column prop="quantity" label="剩余库存" width="100" align="right" />
        <el-table-column prop="product.unit" label="单位" width="60" align="center" />
        <el-table-column label="剩余天数" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.daysLeft <= 0" style="color:#F56C6C;font-weight:bold;">
              已过期 {{ -row.daysLeft }} 天
            </span>
            <span v-else>
              <b :style="{ color: row.daysLeft <= 7 ? '#F56C6C' : (row.daysLeft <= 30 ? '#E6A23C' : '#67C23A') }">
                {{ row.daysLeft }} 天
              </b>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="过期时间" width="120">
          <template #default="{ row }">{{ formatDate(row.expiryDate) }}</template>
        </el-table-column>
        <el-table-column label="入库时间" width="120">
          <template #default="{ row }">{{ formatDate(row.inDate) }}</template>
        </el-table-column>
        <el-table-column label="进价" width="100" align="right">
          <template #default="{ row }">¥{{ Number(row.purchasePrice).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="货值" width="110" align="right">
          <template #default="{ row }">¥{{ (Number(row.purchasePrice) * row.quantity).toFixed(2) }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { expiryApi } from '../api'

const list = ref([])
const daysAhead = ref(30)

const formatDate = (d) => d ? dayjs(d).format('YYYY-MM-DD') : '-'

const counts = computed(() => {
  return {
    expired: list.value.filter(i => i.level === 'expired').length,
    urgent: list.value.filter(i => i.level === 'urgent').length,
    warning: list.value.filter(i => i.level === 'warning').length,
    normal: list.value.filter(i => i.level === 'normal').length
  }
})

async function loadList() {
  const res = await expiryApi.warning(daysAhead.value)
  list.value = res.data
}

onMounted(loadList)
</script>

<style scoped>
.warn-card {
  color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}
.warn-card .label { font-size: 14px; opacity: 0.9; margin-bottom: 8px; }
.warn-card .value { font-size: 28px; font-weight: bold; }
.warn-card.expired { background: linear-gradient(135deg,#C0392B,#E74C3C); }
.warn-card.urgent { background: linear-gradient(135deg,#F56C6C,#f89898); }
.warn-card.warning { background: linear-gradient(135deg,#E6A23C,#f0c78a); }
.warn-card.normal { background: linear-gradient(135deg,#67C23A,#85ce61); }
</style>
