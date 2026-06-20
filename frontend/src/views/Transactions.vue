<template>
  <div>
    <div class="page-title">
      <span>流水记录</span>
      <el-button :icon="Download" @click="exportCsv">导出 CSV</el-button>
    </div>

    <div class="card">
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;">
        <el-radio-group v-model="typeFilter">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="IN">入库</el-radio-button>
          <el-radio-button label="OUT">出库</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
        <el-select
          v-model="productFilter"
          placeholder="选择商品"
          clearable
          filterable
          style="width:220px;"
        >
          <el-option v-for="p in productList" :key="p.id" :label="p.name" :value="p.id" />
        </el-select>
        <el-input
          v-model="operatorFilter"
          placeholder="操作员"
          style="width:140px;"
          clearable
        />
        <el-button type="primary" @click="loadList">查询</el-button>
      </div>

      <el-alert v-if="summary" type="info" :closable="false" style="margin-bottom:12px;">
        <template #title>
          查询范围内：入库 <b>{{ summary.inCount }}</b> 笔，合计 <b style="color:#67C23A;">¥{{ summary.inTotal.toFixed(2) }}</b>　
          出库 <b>{{ summary.outCount }}</b> 笔，合计 <b style="color:#E6A23C;">¥{{ summary.outTotal.toFixed(2) }}</b>
        </template>
      </el-alert>

      <el-table :data="list" stripe>
        <el-table-column label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'IN'" type="success" size="small">入库</el-tag>
            <el-tag v-else type="warning" size="small">出库</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="product.name" label="商品名称" min-width="200" />
        <el-table-column prop="product.category" label="分类" width="80" align="center" />
        <el-table-column prop="quantity" label="数量" width="80" align="right" />
        <el-table-column prop="product.unit" label="单位" width="60" align="center" />
        <el-table-column label="单价" width="100" align="right">
          <template #default="{ row }">¥{{ Number(row.unitPrice).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="合计" width="110" align="right">
          <template #default="{ row }">
            <b :style="{ color: row.type === 'IN' ? '#67C23A' : '#E6A23C' }">
              {{ row.type === 'IN' ? '+' : '-' }}¥{{ Number(row.totalPrice).toFixed(2) }}
            </b>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作员" width="100" />
        <el-table-column prop="remark" label="备注" min-width="140">
          <template #default="{ row }">
            <span v-if="row.remark">{{ row.remark }}</span>
            <span v-else style="color:#c0c4cc;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { Download } from '@element-plus/icons-vue'
import { transactionApi, productApi } from '../api'

const list = ref([])
const productList = ref([])
const typeFilter = ref('')
const productFilter = ref(null)
const operatorFilter = ref('')
const dateRange = ref([
  dayjs().startOf('month').format('YYYY-MM-DD'),
  dayjs().endOf('month').format('YYYY-MM-DD')
])

const formatDate = (d) => d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-'

const summary = computed(() => {
  if (!list.value.length) return null
  const inItems = list.value.filter(t => t.type === 'IN')
  const outItems = list.value.filter(t => t.type === 'OUT')
  return {
    inCount: inItems.length,
    inTotal: inItems.reduce((s, t) => s + Number(t.totalPrice), 0),
    outCount: outItems.length,
    outTotal: outItems.reduce((s, t) => s + Number(t.totalPrice), 0)
  }
})

async function loadList() {
  const params = {}
  if (typeFilter.value) params.type = typeFilter.value
  if (productFilter.value) params.productId = productFilter.value
  if (operatorFilter.value) params.operator = operatorFilter.value
  if (dateRange.value?.length === 2) {
    params.dateFrom = dateRange.value[0]
    params.dateTo = dateRange.value[1]
  }
  const res = await transactionApi.list(params)
  list.value = res.data
}

function exportCsv() {
  if (!list.value.length) return
  const headers = ['类型', '商品', '分类', '数量', '单位', '单价', '合计', '操作员', '备注', '时间']
  const rows = list.value.map(t => [
    t.type === 'IN' ? '入库' : '出库',
    t.product?.name || '',
    t.product?.category || '',
    t.quantity,
    t.product?.unit || '',
    Number(t.unitPrice).toFixed(2),
    Number(t.totalPrice).toFixed(2),
    t.operator || '',
    t.remark || '',
    formatDate(t.createdAt)
  ])
  const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `流水_${dayjs().format('YYYYMMDD_HHmm')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

async function loadProducts() {
  const res = await productApi.list()
  productList.value = res.data
}

onMounted(() => {
  loadProducts()
  loadList()
})
</script>
