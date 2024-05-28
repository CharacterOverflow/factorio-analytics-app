<script setup lang="ts">
import _ from "lodash";
import {IChartDatasetConfig, IChartDatasetTemplate} from "components/ChartTypes";
import {onMounted, type PropType, ref, watch} from "vue";
import {ITrial} from "factorio-analytics";
import {usePublicApi} from "stores/public-api";
import {useDatasets} from "stores/datasets";
import {colors, useQuasar} from "quasar";
import TrialResultsChartRender from "components/TrialResultsChartRender.vue";

const props = defineProps({
  data: {
    type: Object as PropType<ITrial>,
    required: true
  }
})

const emit = defineEmits(['templates'])

const api = usePublicApi()
const datasets = useDatasets()
const $q = useQuasar()

const loading = ref(false)
// const cachedItemData = ref<any>(null)
// const cachedCircuitData = ref<any>(null)
// const cachedPollutionData = ref<any>(null)
// const cachedSystemData = ref<any>(null)
const cachedData = ref<any>(null)
const cachedOptions = ref<any>(null)

//const userOptions = ref<any>({})

const preparedTemplateDatasets = ref<IChartDatasetConfig[]>([])

const addingNewLine = ref(false)

watch(() => datasets.chartData, (value, oldValue) => {
  if (value !== oldValue && value.length !== oldValue?.length) {
    generateChart()
  }
})

async function loadData() {
  if (props.data?.id === undefined) {
    $q.notify({
      color: 'negative',
      message: 'No trial provided',
      position: 'top',
      timeout: 5000
    });
    throw new Error('No data id provided');
  }
  if (loading.value === true) {
    return;
  }
  loading.value = true;
  try {
    // cachedItemData.value = await datasets.loadDataset(props.data?.id, 'item', props.data.tickInterval ?? 60)
    // cachedCircuitData.value = await datasets.loadDataset(props.data?.id, 'circuit', props.data.tickInterval ?? 60)
    // cachedPollutionData.value = await datasets.loadDataset(props.data?.id, 'pollution', props.data.tickInterval ?? 60)
    // cachedSystemData.value = await datasets.loadDataset(props.data?.id, 'system', props.data.tickInterval ?? 60)
    generateChart()
  } catch (e) {
    $q.notify({
      color: 'negative',
      message: 'Error loading dataset: ' + e,
      position: 'top',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
}

const isDefault = ref(true)

function generateChart() {
  try {
    if (!props.data?.id || !props.data?.tickInterval || !props.data?.length)
      return

    let xLabels = datasets.getLabels(props.data.tickInterval, props.data.length)
    let xSmoothedLabels: number[] | string[] = [];

    let options = datasets.getOptions()

    if (datasets.chartData?.length === 0) {
      // no defaults - its easy enough to add your own now

    } else {
      preparedTemplateDatasets.value = []
      for (let i = 0; i < datasets.chartData?.length; i++) {
        let template = datasets.chartData[i]

        if (template.variant == 'item' && props.data?.id) {
          let data = _.chain(datasets.trialItemData.get(props.data?.id).data)
            .filter((v: any) => {
              return v.label === template.label
            })
            .sortBy('tick')
            .map((v: any) => {
              if (template?.field)
                return v[template.field] * (template.field === 'cons' ? -1 : 1)
              else
                return v?.count ?? v
            })
            .value()
          if (datasets.chartSmoothing >= 1) {
            // call datasets.smoothData but this takes an array of x values (tick) and an array of y values (cons or prod)
            // we have the y values, x values are just our labels in general
            let smoothed = datasets.smoothData(xLabels, data, datasets.chartSmoothing);
            data = smoothed.yArr
            xSmoothedLabels = smoothed.xArr
          }
          let dataset = template as IChartDatasetConfig
          dataset.data = data
          dataset.borderColor = template.borderColor
          dataset.tension = .1
          preparedTemplateDatasets.value.push(dataset)
        } else if (template.variant == 'electric' && props.data?.id) {
          let data = _.chain(datasets.trialElectricData.get(props.data?.id).data)
            .filter((v: any) => {
              return v.label === template.label
            })
            .sortBy('tick')
            .map((v: any) => {
              if (template?.field)
                return v[template.field] * (template.field === 'cons' ? -1 : 1)
              else
                return v?.count ?? v
            })
            .value()
          let dataset = template as IChartDatasetConfig
          dataset.data = data
          dataset.borderColor = template.borderColor
          dataset.tension = .1
          preparedTemplateDatasets.value.push(dataset)
        } else if (template.variant == 'circuit' && props.data?.id) {
          let data = _.chain(datasets.trialCircuitData.get(props.data?.id).data)
            .filter((v: any) => {
              return v.label === template.label
            })
            .sortBy('tick')
            .map((v: any) => {
              if (template?.field)
                return v[template.field] * (template.field === 'cons' ? -1 : 1)
              else
                return v?.count ?? v
            })
            .value()
          let dataset = template as IChartDatasetConfig
          dataset.data = data
          dataset.borderColor = template.borderColor
          dataset.tension = .1
          preparedTemplateDatasets.value.push(dataset)
        } else if (template.variant == 'pollution') {
          let data = _.chain(datasets.trialPollutionData.get(props.data?.id).data)
            .filter((v: any) => {
              return v.label === template.label
            })
            .sortBy('tick')
            .map((v: any) => {
              if (template?.field)
                return v[template.field] * (template.field === 'cons' ? -1 : 1)
              else
                return v?.count ?? v
            })
            .value()
          let dataset = template as IChartDatasetConfig
          dataset.data = data
          dataset.borderColor = template.borderColor
          dataset.tension = .1
          preparedTemplateDatasets.value.push(dataset)
        } else if (template.variant == 'system') {
          let data = _.chain(datasets.trialSystemData.get(props.data?.id).data)
            .filter((v: any) => {
              return v.label === template.label
            })
            .sortBy('tick')
            .map((v: any) => {
              if (template?.field)
                return v[template.field] * (template.field === 'cons' ? -1 : 1)
              else
                return v?.count ?? v
            })
            .value()
          let dataset = template as IChartDatasetConfig
          dataset.data = data
          dataset.borderColor = template.borderColor
          dataset.tension = .1
          preparedTemplateDatasets.value.push(dataset)
        }
      }
    }

    if (datasets.chartSmoothing >= 1) {
      renderChart(xSmoothedLabels, options)
    } else {
      renderChart(xLabels, options)
    }
  } catch (e) {
    console.log(e)
  }
}

function renderChart() {
  // emit our prepared datasets now
  cachedData.value = {
    labels: labels,
    datasets: preparedTemplateDatasets.value
  }
  cachedOptions.value = options
}

function tickToTime(tick: number) {
  return (tick / 60) / 60
}

function generateDefaultLabels() {
  // lets redo this and actually just generate the data we need
  // it will start at tick 0, adding by interval each new record, until we hit the 'length'
  /// if we will exceed length, we will stop at length
  let ret = [];

  if (props.data?.length && props.data?.tickInterval) {
    for (let i = 0; i < props.data.length; i += props.data.tickInterval) {
      ret.push(i)
    }
    // if the last record is > props.data.length, set it to props.data.length
    if (ret[ret.length - 1] > props.data.length)
      ret[ret.length - 1] = props.data.length
  }
  return ret.map((v: any) => {
    return tickToTime(v.tick)
  }).sort((a, b) => a - b)

}

//
// function generateDefaultDatasets(): any[] {
//
//   // by default 2 will be shown, for highest consumption and highest prod
//   const datasetList: IChartDatasetConfig[] = [];
//
//   // find highest PROD and higest CONS by metadata
//   let highestProdItem = _.maxBy(props.data?.itemMetadata?.total, (v: any) => {
//     return v?.value?.prod
//   })
//   let highestConsItem = _.maxBy(props.data?.itemMetadata?.total, (v: any) => {
//     return v?.value?.cons
//   })
//
//   // now, we want to take each of these (which  are a key/value pair, where value is {cons, prod} ) and generate a chart config for each
//   if (highestProdItem) {
//     // grab list of all tick data for this item, in order ascending tick
//     let data = _.chain(cachedRawData.value?.data)
//       .filter((v: any) => {
//         return v.label === highestProdItem.key
//       })
//       .sortBy('tick')
//       .map((v: any) => {
//         return v.prod
//       })
//       .value()
//     datasetList.push({
//       label: `${highestProdItem.key} (prod)`,
//       raw_data: data,
//       borderColor: '#456cea',
//       tension: 0.1,
//       //smooth: 1,
//       variant: 'item',
//       field: 'cons'
//     })
//   }
//   if (highestConsItem) {
//     // grab list of all tick data for this item, in order ascending tick
//     let data = _.chain(cachedRawData.value?.data)
//       .filter((v: any) => {
//         return v.label === highestConsItem.key
//       })
//       .sortBy('tick')
//       .map((v: any) => {
//         return v.cons
//       })
//       .value()
//     datasetList.push({
//       label: `${highestConsItem.key} (cons)`,
//       raw_data: data,
//       borderColor: '#c44848',
//       tension: 0.1,
//       //smooth: 1,
//       variant: 'item',
//       field: 'cons'
//     })
//   }
//   datasetsList.value = datasetList
//   return datasetList
// }

function onChartChangesMade(idx: number = -1, chart: IChartDatasetConfig) {
  // find the index of the chart in the datasetsList
  if (idx === -1) {
    // this is a new chart, add it to the list
    preparedTemplateDatasets.value.push(chart)
  } else {
    // this is an existing chart, update it. Note the entire array must update!
    preparedTemplateDatasets.value[idx] = chart
    preparedTemplateDatasets.value = [...preparedTemplateDatasets.value]
  }
  // refresh our chart as well (redraw)
  renderChart(generateDefaultLabels(), datasets.finalOptions)
}

function onChartDelete(idx: number = -1, chart: IChartDatasetConfig) {
  if (idx === -1) {
    // something went wrong. throw error
    throw new Error('Chart index not found')
  } else {
    // remove this chart from the list, then set the list again
    preparedTemplateDatasets.value = preparedTemplateDatasets.value.filter((v, i) => {
      return i !== idx
    })

    // refresh our chart as well (redraw)
    renderChart(generateDefaultLabels(), datasets.finalOptions)
  }
}

// function onAddNewLine(val) {
//   newPendingLine.value = val
//   if (newPendingLine.value) {
//     datasetsList.value.push(newPendingLine.value)
//     generateChart()
//     refreshChart.value = true
//   }
//   addingNewLine.value = false
// }

function clearChart() {
  preparedTemplateDatasets.value = []
  renderChart([], datasets.finalOptions)
}

const refreshChart = ref(false)

onMounted(() => {
  loadData()
})


</script>

<template>
  <div>
    <div v-if="props.data?.id">
      <TrialResultsChartRender @refresh="refreshChart = false"
                               v-model:refresh="refreshChart"
                               class="chartConstraint"
                               :data="props.data"
                               :chart-options="cachedOptions"
                               :chart-configs="cachedData"></TrialResultsChartRender>
      <div>
        <q-list>
          <q-separator class="q-mb-lg"></q-separator>
          <q-item>
            <q-item-section class="text-center">
              <q-item-label>Chart Title / Smoothing</q-item-label>
              <q-item-label caption>0 means smoothing disabled. Only ITEM data is smoothed</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="cachedData?.labels">
            <q-item-section>
              <q-input @change="generateChart()" v-model="datasets.chartUserTitle" label="Chart Title" outlined></q-input>
            </q-item-section>
            <q-item-section class="q-pl-lg q-pr-lg">
              <q-slider dense @change="generateChart()"
                        :min="0" :max="(cachedData.labels.length / 2)"
                        label-always
                        v-model="datasets.chartSmoothing"></q-slider>
            </q-item-section>
          </q-item>
          <q-item
            :style="{
                        backgroundColor: `${colors.lighten(line.borderColor, 50) ?? '#c4c4c4'}`,
                      }"
            v-for="(line, idx) in preparedTemplateDatasets"
            :key="idx">
            <q-item-section>
              <q-item-label overline>Item (Field)</q-item-label>
              <q-item-label>{{ line.label }} ({{ line?.field ?? 'count' }})</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-input
                filled
                v-model="line.borderColor"
                class="my-input"
              >
                <template v-slot:append>
                  <q-icon name="colorize" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-color @change="generateChart()" v-model="line.borderColor"/>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </q-item-section>
            <q-item-section>
              <q-item-label> {{ line?.data?.length }} Data Points</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn @click="onChartDelete(idx, line)" square color="negative" icon="delete"></q-btn>
            </q-item-section>
          </q-item>
          <q-separator inset class="q-mt-sm q-mb-sm"></q-separator>
          <q-item>
            <!--            <q-item-section side>-->
            <!--              <q-btn-group>-->
            <!--                <q-btn @click="startAddNewLine()" color="primary">ADD LINE</q-btn>-->
            <!--              </q-btn-group>-->
            <!--            </q-item-section>-->
            <q-item-section>

            </q-item-section>
            <q-item-section side>
              <q-btn @click="clearChart()" color="negative">CLEAR CHART</q-btn>
            </q-item-section>
          </q-item>

        </q-list>
      </div>
      <!--      <q-dialog full-width v-model="addingNewLine">-->
      <!--        <TrialResultsChartLineAdd @chart="args => {onAddNewLine(args)}" v-model:chart="newPendingLine" :data="props.data"></TrialResultsChartLineAdd>-->
      <!--      </q-dialog>-->
    </div>
    <div>

    </div>
  </div>
</template>

<style scoped>
.chartConstraint {
  margin-top: 1em;
  min-height: 50em;
}
</style>
