<script setup lang="ts">
/*
* this component will REPLACE the SourceRender currently on ViewTrial
*
* */

import {computed, onMounted, ref} from "vue";
import {usePublicApi} from "stores/public-api";

const props = defineProps<{
  id: string
}>()

const api = usePublicApi();

const bpText = ref<string | undefined>()
const sourceTextUrl = computed(() => {
  return `https://api.factorioanalytics.com/query/${props.id}/source_raw`
})

onMounted(() => {
  // cache-load source now
  api.loadSource(props.id).then((data) => {
    bpText.value = data?.text
  }).catch((error) => {
    // do something with the error
    console.log('Error loading source: ' + error)
  })
})

function goToFBE() {
  // open the FBE page for this source in another tab
  window.open(`https://fbe.teoxoy.com?source=${sourceTextUrl.value}`, '_blank')
}


</script>

<template>
  <q-card class="shadow-0">
    <q-card-section class="full-height full-width">
      <q-btn disable @click="goToFBE()" class=" full-width full-height" flat>
        RENDER COMING SOON
      </q-btn>
    </q-card-section>
  </q-card>
</template>

<style scoped>

</style>
