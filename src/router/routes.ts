import {RouteRecordRaw} from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{path: '', component: () => import('pages/IndexPage.vue')},
      //{path: '/about', component: () => import('pages/AboutPage.vue')},
      //{path: '/source', component: () => import('pages/SourcePage.vue')},
      {path: '/source/:id', component: () => import('pages/ViewSource.vue'), props: true},
      {path: '/example', component: () => import('pages/ViewExample.vue')},
      {path: '/debug', component: () => import('pages/DebugPage.vue')},
      //{path: '/trial/:id', component: () => import('pages/ViewTrial.vue'), props: true}
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
