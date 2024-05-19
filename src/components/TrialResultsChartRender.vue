<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import _ from 'lodash'
import {Line} from 'vue-chartjs'
import {onMounted, type PropType, ref, watch} from "vue";
import {ITrial} from "factorio-analytics";
import {usePublicApi} from "stores/public-api";
import {useDatasets} from "stores/datasets";
import {useQuasar} from "quasar";
import {IChartDatasetConfig} from "components/ChartTypes";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

ChartJS.defaults.color = '#000000'

// we are going to assume our DATA passed in is just going to be a reference to the trial information we have available
// from here, we need to make sure we have the bulk data loaded. If not, just display a button prompting to download the data
const props = defineProps({
  data: {
    type: Object as PropType<ITrial>,
    required: true
  },
  chartConfigs: {
    type: Object as PropType<IChartDatasetConfig[]>,
    required: false
  },
  chartOptions: {
    type: Object as PropType<any>,
    required: false
  },
  refresh: {
    type: Boolean,
    required: false,
    default: false
  }
})
const emit = defineEmits(['refresh'])

const api = usePublicApi()
const datasets = useDatasets()
const $q = useQuasar()

const chartRef = ref<any>()

//
// const cachedData = ref<any>(null)
// const cachedOptions = ref<any>(null)
//
// // const exampleData = {
// //   labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
// //   datasets: [
// //     {
// //       label: 'Data One',
// //       data: [40, 39, 10, 40, 39, 80, 40]
// //     }
// //   ]
// // }
//
// const loading = ref(false);
// const cachedRawData = ref<any>(null);
//
// // rethink this
// // instead of loading data here on render, load and organize it all in the builder instead
// // pass into here with props instead
// async function loadData() {
//   if (props.data?.id === undefined) {
//     throw new Error('No data id provided');
//   }
//   if (loading.value === true) {
//     return;
//   }
//   loading.value = true;
//   try {
//     cachedRawData.value = await datasets.loadDataset(props.data?.id, 'item')
//     generateDefaultChart()
//   } catch (e) {
//     $q.notify({
//       color: 'negative',
//       message: 'Error loading dataset: ' + e,
//       position: 'top',
//       timeout: 5000
//     });
//   } finally {
//     loading.value = false;
//   }
// }
//
// function generateDefaultChart() {
//   cachedOptions.value = generateDefaultOptions()
//   cachedData.value = {
//     labels: generateDefaultLabels(),
//     datasets: generateDefaultDatasets()
//   }
// }
//

watch(() => props.refresh, (value) => {
  if (value == true) {
    refreshChart()
  }
})

function onChartRender(chart) {
  console.log(chart)
}

function refreshChart() {
  // need to figure out how to do this part - i think turning off  a v-if for the chart and 500ms later turning it back on
  refreshing.value = true;
  setTimeout(() => {
    refreshing.value = false;
    emit('refresh', false)
  }, 50)
}

const refreshing = ref(false);
//const labels = Utils.months({count: 7});
/*const data = {
  labels: ['t1', 't2', 't3', 't4', 't5', 't6', 't7'],
  datasets: [{
    label: 'My First Dataset',
    data: [65, 59, 80, 81, 56, 55, 40],
    fill: false,
    borderColor: 'rgb(75, 192, 192)',
    color: 'rgb(211,17,17)',
    tension: 0.1
  }]
};*/

function exportChart() {
  if (chartRef.value) {
    const image = chartRef.value.chart.toBase64Image();
    if (image) {
      const a = document.createElement('a');
      a.href = image;
      a.download = 'chart.png';
      a.click();
    }
  }
}

</script>

<template>
  <div v-if="!props.data?.id || !props.chartConfigs || !props.chartOptions || refreshing">
    <q-badge color="secondary" label="Waiting for data..."></q-badge>
  </div>
  <div v-else>
    <q-badge icon-right="tag"
             color="secondary" class="q-pr-sm q-mr-md text-subtitle1">GRAPHING
      <q-icon class="q-pl-xs" name="analytics"></q-icon>
    </q-badge>
    <q-btn-group>
      <q-btn color="primary" @click="refreshChart" :loading="refreshing">
        Refresh Chart
      </q-btn>
      <q-btn color="secondary" @click="exportChart()">Export</q-btn>
    </q-btn-group>
  </div>
  <div class="full-width chartConstraint">

    <Line ref="chartRef" @chart:render="onChartRender" class="full-height"
          v-if="!(!props.data?.id || !props.chartConfigs || !props.chartOptions || refreshing)"
          :data="props.chartConfigs"
          :options="props.chartOptions"></Line>
  </div>

</template>

<style scoped>
.chartConstraint {
  margin-top: 1em;
  width: 100%;
  height: 40vh;
}
</style>
