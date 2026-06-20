import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/products', name: 'Products', component: () => import('../views/Products.vue') },
  { path: '/inventory', name: 'Inventory', component: () => import('../views/Inventory.vue') },
  { path: '/transactions', name: 'Transactions', component: () => import('../views/Transactions.vue') },
  { path: '/expiry', name: 'Expiry', component: () => import('../views/Expiry.vue') }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
