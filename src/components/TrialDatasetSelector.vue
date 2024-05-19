<script setup lang="ts">

import {computed, onMounted, PropType, ref} from "vue";
import {ITrial} from "factorio-analytics";

const props = defineProps({
  data: {
    type: Object as PropType<ITrial>,
    required: true
  },
  selected: {
    type: String,
    required: false
  }
})

const emit = defineEmits(['selected'])

const options = ref<any[]>([
  'item',
  'circuit',
  'pollution',
  'system'
])
const selectedInner = ref<string | undefined>()
const selected = computed({
  get: () => {
    return props.selected ?? selectedInner.value
  },
  set: (value: string | undefined) => {
    selectedInner.value = value
    emit('selected', value)
  }
})

</script>

<template>
  <q-select outlined clearable :options="options" option-label="label" v-model="selected">

  </q-select>
</template>

<style scoped>

</style>
