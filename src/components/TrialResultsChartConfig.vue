<script setup lang="ts">
import {onMounted, PropType, ref, watch} from "vue";
import {ITrial} from "factorio-analytics";
import {IChartDatasetConfig} from "components/ChartTypes";
import TrialDatasetSelector from "components/TrialDatasetSelector.vue";

const props = defineProps({
  data: {
    type: Object as PropType<ITrial>,
    required: true
  },
  chart: {
    type: Object as PropType<IChartDatasetConfig>,
    required: true
  }
})

const emit = defineEmits(['chart', 'delete'])

// take all local changes and apply them back to the parent
function applyChanges() {
  // create a new 'chart' object and emit it
  emit('chart', {
    data: props.chart?.data,
    variant: props.chart?.variant,
    label: props.chart.label,
    tension: props.chart?.tension,
    borderColor: props.chart?.borderColor,
    hidden: props.chart?.hidden
  })
}

function removeDataset() {
  // removes the dataset from itself! we can't access the array here, but we CAN emit 'delete'
  emit('delete', props.chart)
}

// watch(() => props.chart, (value, oldValue) => {
//   if (value !== oldValue) {
//     //refreshChanges()
//   }
// })

onMounted(() => {
  //refreshChanges()
})

</script>

<template>
  <q-list v-if="props.data" class="bg-grey-3">
    <q-item v-if="props.data && !props.chart">
      <q-item-section>
        select type
      </q-item-section>
      <q-item-section>
        select label
      </q-item-section>
      <q-item-section>
        select field
      </q-item-section>
    </q-item>
    <q-item v-else>
      <q-item-section disabled side avatar>
        <q-icon name="lock">

        </q-icon>
      </q-item-section>
      <q-item-section disabled side>
        <q-item-label>Data Locked</q-item-label>
        <q-item-label caption>Remove and add new line to change</q-item-label>
      </q-item-section>
      <q-item-section disabled>
        <q-item-label overline>
          Variant
        </q-item-label>
        <q-item-label>
          <q-chip color="blue-grey-3" class="text-uppercase"> {{ props.chart.variant }}</q-chip>
        </q-item-label>
      </q-item-section>
      <q-item-section disabled>
        <q-item-label overline>
          Label
        </q-item-label>
        <q-item-label>
          <q-chip color="blue-grey-3" class="text-uppercase">{{ props.chart.label }}</q-chip>
        </q-item-label>
      </q-item-section>
      <q-item-section disabled>
        <q-item-label overline>
          Field
        </q-item-label>
        <q-item-label>
          <q-chip color="blue-grey-3" class="text-uppercase">{{ props.chart.field }}</q-chip>
        </q-item-label>
      </q-item-section>
      <q-item-section side avatar>
        <q-btn @click="removeDataset()" square color="negative" icon="delete"></q-btn>
      </q-item-section>
    </q-item>
    <q-item v-if="props.chart?.data.length > 0">
      <q-item-section side>
        <q-item-label>
          Chart Options
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <div>
          <q-color default-view="palette" class="colorInputSize" v-model="props.chart.borderColor" format-model="hex"/>
        </div>
      </q-item-section>
      <q-item-section>
        <!--        <q-input hint="Determines how 'floppy' a line is drawn" label="Tension" outlined :rules="[-->
        <!--                    (v) => !!v || 'Required',-->
        <!--                    (v) => v >= 0 || 'Must be greater than 0',-->
        <!--                    (v) => v <= 1 || 'Must be less than 1'-->
        <!--                  ]" type="number" v-model="props.chart.tension"></q-input>-->
        <q-slider :step=".1" v-model="props.chart.tension" :min="0" :max="1" label-always></q-slider>
        <q-checkbox v-model="props.chart.hidden" label="Hidden"></q-checkbox>
        <q-separator class="q-mt-xl q-mb-xl" ></q-separator>
        <q-btn size="lg" color="positive" @click="applyChanges()">Save Changes</q-btn>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<style scoped>
.colorInputSize {
  height: 100%
}
</style>
