<template>
  <div>
    <div class="page-title"><span>出入库操作</span></div>

    <el-row :gutter="16">
      <el-col :span="12">
        <div class="card">
          <div style="font-weight:bold;font-size:16px;margin-bottom:16px;color:#67C23A;">
            <el-icon style="vertical-align:middle;"><Bottom /></el-icon>
            商品入库
          </div>
          <el-form :model="inForm" label-width="90px" size="default">
            <el-form-item label="选择商品">
              <el-select
                v-model="inForm.productId"
                filterable
                placeholder="输入名称搜索"
                style="width:100%;"
                @change="onProductChange('in')"
              >
                <el-option
                  v-for="p in productList"
                  :key="p.id"
                  :label="`${p.name}（${p.category}）`"
                  :value="p.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="入库数量">
              <el-input-number v-model="inForm.quantity" :min="1" :step="1" style="width:100%;" />
            </el-form-item>
            <el-form-item label="进价(元)">
              <el-input-number v-model="inForm.purchasePrice" :min="0" :precision="2" :step="1" style="width:100%;" />
            </el-form-item>
            <el-form-item label="批号">
              <el-input v-model="inForm.batchNo" placeholder="选填" />
            </el-form-item>
            <el-form-item v-if="currentInProduct?.hasExpiry" label="保质期至">
              <el-date-picker
                v-model="inForm.expiryDate"
                type="date"
                placeholder="选择过期日期"
                value-format="YYYY-MM-DD"
                style="width:100%;"
              />
            </el-form-item>
            <el-form-item label="操作员">
              <el-input v-model="inForm.operator" placeholder="如：老板、小张" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="inForm.remark" type="textarea" :rows="2" placeholder="选填" />
            </el-form-item>
            <el-form-item>
              <el-button type="success" style="width:100%;" @click="doStockIn">
                确认入库
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="card">
          <div style="font-weight:bold;font-size:16px;margin-bottom:16px;color:#E6A23C;">
            <el-icon style="vertical-align:middle;"><Top /></el-icon>
            商品出库
          </div>
          <el-form :model="outForm" label-width="90px" size="default">
            <el-form-item label="选择商品">
              <el-select
                v-model="outForm.productId"
                filterable
                placeholder="输入名称搜索"
                style="width:100%;"
                @change="onProductChange('out')"
              >
                <el-option
                  v-for="p in stockProducts"
                  :key="p.productId"
                  :label="`${p.productName}（库存：${p.quantity}${p.unit}）`"
                  :value="p.productId"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="当前库存">
              <el-tag :type="currentOutStock <= 10 ? 'danger' : 'success'" size="large">
                {{ currentOutStock }} {{ currentOutProduct?.unit || '' }}
              </el-tag>
            </el-form-item>
            <el-form-item label="出库数量">
              <el-input-number
                v-model="outForm.quantity"
                :min="1"
                :max="currentOutStock || 99999"
                :step="1"
                style="width:100%;"
              />
            </el-form-item>
            <el-form-item label="售价(元)">
              <el-input-number v-model="outForm.unitPrice" :min="0" :precision="2" :step="1" style="width:100%;">
                <template #prepend>单价</template>
              </el-input-number>
              <div style="margin-top:6px;color:#606266;font-size:13px;">
                合计：<span style="color:#F56C6C;font-weight:bold;font-size:16px;">
                  ¥{{ (outForm.quantity * outForm.unitPrice).toFixed(2) }}
                </span>
              </div>
            </el-form-item>
            <el-form-item label="操作员">
              <el-input v-model="outForm.operator" placeholder="如：老板、小张" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="outForm.remark" type="textarea" :rows="2" placeholder="选填" />
            </el-form-item>
            <el-form-item>
              <el-button type="warning" style="width:100%;" @click="doStockOut">
                确认出库
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>

    <div class="card">
      <div style="font-weight:bold;font-size:16px;margin-bottom:12px;">当前库存明细</div>
      <el-table :data="stockItems" size="small" stripe>
        <el-table-column prop="product.name" label="商品名称" min-width="200" />
        <el-table-column prop="product.category" label="分类" width="80" align="center" />
        <el-table-column prop="batchNo" label="批号" width="110" />
        <el-table-column prop="quantity" label="数量" width="80" align="right" />
        <el-table-column prop="product.unit" label="单位" width="60" align="center" />
        <el-table-column label="进价" width="100" align="right">
          <template #default="{ row }">¥{{ Number(row.purchasePrice).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="保质期" width="120">
          <template #default="{ row }">
            <span v-if="row.expiryDate">{{ formatDate(row.expiryDate) }}</span>
            <span v-else style="color:#c0c4cc;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="入库日期" width="120">
          <template #default="{ row }">{{ formatDate(row.inDate) }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { productApi, inventoryApi } from '../api'

const productList = ref([])
const stockProducts = ref([])
const stockItems = ref([])

const inForm = reactive({
  productId: null, quantity: 1, purchasePrice: 0,
  batchNo: '', expiryDate: '', operator: '', remark: ''
})
const outForm = reactive({
  productId: null, quantity: 1, unitPrice: 0,
  operator: '', remark: ''
})

const currentInProduct = computed(() =>
  productList.value.find(p => p.id === inForm.productId)
)
const currentOutProduct = computed(() => {
  const s = stockProducts.value.find(p => p.productId === outForm.productId)
  return productList.value.find(p => p.id === s?.productId)
})
const currentOutStock = computed(() => {
  const s = stockProducts.value.find(p => p.productId === outForm.productId)
  return s?.quantity || 0
})

const formatDate = (d) => d ? dayjs(d).format('YYYY-MM-DD') : '-'

function onProductChange(type) {
  if (type === 'out') {
    const p = currentOutProduct.value
    if (p) outForm.unitPrice = Number(p.price)
  }
}

async function loadProducts() {
  const res = await productApi.list()
  productList.value = res.data
}

async function loadStock() {
  const [summaryRes, itemsRes] = await Promise.all([
    productApi.stockSummary(),
    inventoryApi.stockItems()
  ])
  stockProducts.value = summaryRes.data
  stockItems.value = itemsRes.data
}

async function doStockIn() {
  if (!inForm.productId) return ElMessage.warning('请选择商品')
  if (!inForm.quantity || inForm.quantity <= 0) return ElMessage.warning('请输入入库数量')
  if (currentInProduct.value?.hasExpiry && !inForm.expiryDate) {
    return ElMessage.warning('该商品需要填写保质期')
  }
  await inventoryApi.stockIn(inForm)
  ElMessage.success('入库成功')
  Object.assign(inForm, { productId: null, quantity: 1, purchasePrice: 0, batchNo: '', expiryDate: '', operator: '', remark: '' })
  loadStock()
}

async function doStockOut() {
  if (!outForm.productId) return ElMessage.warning('请选择商品')
  if (!outForm.quantity || outForm.quantity <= 0) return ElMessage.warning('请输入出库数量')
  if (outForm.quantity > currentOutStock.value) return ElMessage.warning('库存不足')
  await inventoryApi.stockOut(outForm)
  ElMessage.success('出库成功')
  Object.assign(outForm, { productId: null, quantity: 1, unitPrice: 0, operator: '', remark: '' })
  loadStock()
}

onMounted(() => {
  loadProducts()
  loadStock()
})
</script>
