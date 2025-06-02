import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home/Index.vue')
    },
    {
      path: '/add/futures',
      name: 'add_futures',
      component: () => import('../views/AddFutures/Index.vue'),
      props: true
    },
    {
      path: '/add/stock',
      name: 'add_stock',
      component: () => import('../views/AddStock/Index.vue'),
      props: true
    },
    {
      path: '/testlist',
      name: 'test_list',
      component: () => import('../views/TestList/Index.vue')
    },
    {
      path: '/list',
      name: 'list',
      component: () => import('../views/List/Index.vue')
    }
  ]
}) 