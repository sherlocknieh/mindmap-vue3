import * as Vue from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Edit',
    component: Vue.defineAsyncComponent(() => import('./pages/Edit/Index.vue')),
  },
  {
    path: '/index',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
