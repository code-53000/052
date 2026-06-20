<template>
  <div>
    <div class="page-title">
      <span>商品管理</span>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增商品</el-button>
    </div>

    <div class="card">
      <div style="display:flex;gap:12px;margin-bottom:16px;">
        <el-input
          v-model="keyword"
          placeholder="搜索商品名称"
          style="width:240px;"
          clearable
          :prefix-icon="Search"
          @keyup.enter="loadList"
        />
        <el-select
          v-model="category"
          placeholder="选择分类"
          style="width:160px;"
          clearable
        >
          <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
        </el-select>
        <el-button type="primary" @click="loadList">查询</el-button>
      </div>

      <el-table :data="list" stripe>
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="name" label="商品名称" min-width="200" />
        <el-table-column prop="category" label="分类" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="tagType(row.category)">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="80" align="center" />
        <el-table-column label="售价(元)" width="110" align="right">
          <template #default="{ row }">¥{{ Number(row.price).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="需保质期" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.hasExpiry" type="warning" size="small">是</el-tag>
            <el-tag v-else type="info" size="small">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" link type="danger" @click="removeItem(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑商品' : '新增商品'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="如：尿素 46%" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="选择或输入分类" allow-create filterable style="width:100%;">
            <el-option label="化肥" value="化肥" />
            <el-option label="农药" value="农药" />
            <el-option label="种子" value="种子" />
            <el-option label="农具" value="农具" />
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-select v-model="form.unit" placeholder="选择单位" allow-create filterable style="width:100%;">
            <el-option label="袋" value="袋" />
            <el-option label="瓶" value="瓶" />
            <el-option label="桶" value="桶" />
            <el-option label="箱" value="箱" />
            <el-option label="公斤" value="公斤" />
          </el-select>
        </el-form-item>
        <el-form-item label="售价(元)" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" :step="1" style="width:100%;" />
        </el-form-item>
        <el-form-item label="管理保质期">
          <el-switch v-model="form.hasExpiry" active-text="是（如农药、种子）" inactive-text="否（如普通化肥）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { productApi } from '../api'

const list = ref([])
const categories = ref([])
const keyword = ref('')
const category = ref('')
const dialogVisible = ref(false)
const formRef = ref(null)

const form = reactive({
  id: null,
  name: '',
  category: '',
  unit: '袋',
  price: 0,
  hasExpiry: false
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur' }]
}

const formatDate = (d) => d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-'

const tagType = (cat) => {
  if (cat === '化肥') return 'success'
  if (cat === '农药') return 'warning'
  if (cat === '种子') return 'primary'
  return 'info'
}

async function loadList() {
  const res = await productApi.list({ keyword: keyword.value, category: category.value })
  list.value = res.data
}

async function loadCategories() {
  const res = await productApi.categories()
  categories.value = res.data
}

function openDialog(row) {
  if (row) {
    Object.assign(form, row)
    form.price = Number(row.price)
  } else {
    Object.assign(form, { id: null, name: '', category: '', unit: '袋', price: 0, hasExpiry: false })
  }
  dialogVisible.value = true
}

async function submit() {
  await formRef.value.validate()
  if (form.id) {
    await productApi.update(form.id, { ...form, id: undefined })
    ElMessage.success('修改成功')
  } else {
    await productApi.create({ ...form, id: undefined })
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadList()
  loadCategories()
}

async function removeItem(row) {
  await ElMessageBox.confirm(`确定删除「${row.name}」？将同时删除相关库存和流水记录`, '提示', { type: 'warning' })
  await productApi.remove(row.id)
  ElMessage.success('已删除')
  loadList()
}

onMounted(() => {
  loadList()
  loadCategories()
})
</script>
