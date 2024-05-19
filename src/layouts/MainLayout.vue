<template>
  <q-layout view="hHh LpR lFf">

    <q-header bordered class="bg-secondary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          Factorio Analytics
        </q-toolbar-title>
<!--        Want to have a github icon and link to my profile-->
        <q-toolbar-title shrink>

          <q-btn class="q-pt-none q-pb-none" color="white" text-color="black" type="a" href="https://github.com/CharacterOverflow/factorio-analytics" target="_blank">
            GITHUB
            <div class="q-pl-sm q-pt-sm">
              <svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
              </svg>
            </div>
          </q-btn>
        </q-toolbar-title>
<!--        <q-toolbar-title class="text-subtitle2" shrink>V1.0 ALPHA</q-toolbar-title>-->
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" overlay bordered>
      <!-- drawer content -->
      <q-list padding separator class="q-pa-sm">
        <q-item
          clickable
          :to="{ path: '/' }"
          class=" rounded-borders">
          <q-item-section side avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Home</q-item-label>
          </q-item-section>
        </q-item>
<!--        <q-item-->
<!--          clickable-->
<!--          :to="{ path: '/about' }"-->
<!--          class=" rounded-borders">-->
<!--          <q-item-section side avatar>-->
<!--            <q-icon name="help" />-->
<!--          </q-item-section>-->
<!--          <q-item-section>-->
<!--            <q-item-label>About</q-item-label>-->
<!--          </q-item-section>-->
<!--        </q-item>-->
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
