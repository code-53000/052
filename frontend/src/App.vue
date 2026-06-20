<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="logo">
        <el-icon :size="28" color="#67C23A"><Goods /></el-icon>
        <span>农资店进销存系统</span>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px" class="app-aside">
        <el-menu
          :default-active="$route.path"
          router
          class="side-menu"
          background-color="#001529"
          text-color="#fff"
          active-text-color="#67C23A"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/products">
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </el-menu-item>
          <el-menu-item index="/inventory">
            <el-icon><Box /></el-icon>
            <span>出入库</span>
          </el-menu-item>
          <el-menu-item index="/transactions">
            <el-icon><Document /></el-icon>
            <span>流水记录</span>
          </el-menu-item>
          <el-menu-item index="/expiry">
            <el-icon><Warning /></el-icon>
            <span>保质期预警</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body, #app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.app-container {
  height: 100%;
}
.app-header {
  background: linear-gradient(90deg, #2b5e1e 0%, #67C23A 100%);
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 24px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: bold;
}
.app-aside {
  background: #001529;
}
.side-menu {
  border-right: none;
  height: 100%;
}
.app-main {
  background: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}
.page-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #303133;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card {
  background: #fff;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
</style>
