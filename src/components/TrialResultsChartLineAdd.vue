<script setup lang="ts">
/*
* this will be used to edit a line chart type setup
*
*
*
* */

import {onMounted, PropType, ref, watch} from "vue";
import {ITrial} from "factorio-analytics";
import {IChartDatasetConfig} from "components/ChartTypes";
import TrialBasicInfoCard from "components/TrialBasicInfoCard.vue";
import {usePublicApi} from "stores/public-api";
import {useDatasets} from "stores/datasets";
import {useQuasar} from "quasar";
import _ from "lodash";
import TrialResultsChartConfig from "components/TrialResultsChartConfig.vue";

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

const api = usePublicApi()
const datasets = useDatasets()
const $q = useQuasar()

interface ILocalDataSummary {
  variant: string
  records: number
  uniqueLabels: string[]
}

const localItem = ref<ILocalDataSummary>()
const localCircuit = ref<ILocalDataSummary>()
const localPollution = ref<ILocalDataSummary>()
const localSystem = ref<ILocalDataSummary>()

const localItemData = ref<any>()
const localCircuitData = ref<any>()
const localPollutionData = ref<any>()
const localSystemData = ref<any>()
const localSystemDataOptions = ref<string[]>()

const selectedVariant = ref('')
const selectedField = ref('')
const selectedLabel = ref('')

/*
* This is a larger component compared to the 'chart config' variant.
* it will be inside the popup, and needs to display helpful information on the sides about the trial
* */

onMounted(() => {
  // from here, we need to now reference the data we have loaded for this trial
  // if no metadata is found loaded for a trial+category, then provide a button option to download it
  if (props.data?.id) {
    // datasets.loadDataset(props.data.id, 'item').then((data) => {
    //   // calculate needed values and store
    // }).catch((error) => {
    //   // do something with the error
    //   $q.notify({
    //     color: 'negative',
    //     message: 'Error loading item dataset: ' + error,
    //     position: 'top',
    //     timeout: 5000
    //   });
    // })
    // pollution data is small - always load it here
    datasets.loadDataset(props.data.id, 'pollution').then((data) => {
      // data is an array, with each object having a tick, label, and count.
      // complete the interface below using lodash functionality
      if (data.data) {
        localPollution.value = {
          variant: 'Pollution',
          records: data.data.length,
          uniqueLabels: ['pollution']
        }
        localPollutionData.value = data.data
      } else {
        localPollution.value = undefined
      }
    }).catch((error) => {
      // do something with the error
      $q.notify({
        color: 'negative',
        message: 'Error loading pollution dataset: ' + error,
        position: 'top',
        timeout: 5000
      });
    })
    // we will be loading item and circuit information based on metadata.
    if (props.data?.itemMetadata && props.data?.itemMetadata.total.length >= 2) {
      datasets.loadDataset(props.data.id, 'item').then((data) => {
        if (data.data) {
          localItem.value = {
            variant: 'Item',
            records: data.data.length,
            uniqueLabels: _.uniq(data.data.map((d) => d.label))
          }
          localItemData.value = data.data
        } else {
          localItem.value = undefined
        }
      }).catch((error) => {
        // do something with the error
        $q.notify({
          color: 'negative',
          message: 'Error loading item dataset: ' + error,
          position: 'top',
          timeout: 5000
        });
      })
    }
    if (props.data?.circuitMetadata && props.data?.circuitMetadata?.signals.length >= 2) {
      datasets.loadDataset(props.data.id, 'circuit').then((data) => {
        if (data.data) {
          localCircuit.value = {
            variant: 'Circuit',
            records: data.data.length,
            uniqueLabels: _.uniq(data.data.map((d) => d.label))
          }
          localCircuitData.value = data.data
        } else {
          localCircuit.value = undefined
        }
      }).catch((error) => {
        // do something with the error
        $q.notify({
          color: 'negative',
          message: 'Error loading circuit dataset: ' + error,
          position: 'top',
          timeout: 5000
        });
      })
    }
    if (props.data?.systemMetadata && props.data?.systemMetadata[0]?.key) {
      datasets.loadDataset(props.data.id, 'system').then((data) => {
        if (data.data) {
          localSystem.value = {
            variant: 'System',
            records: data.data.length,
            uniqueLabels: Object.keys(data.data[0]).filter((v) => {
              return !(v == 'label' || v == 'tick' || v == 'trial_id')
            })
          }
          localSystemData.value = data.data
          localSystemDataOptions.value = Object.keys(localSystemData.value[0]).filter((v) => {
            return !(v == 'label' || v == 'tick' || v == 'trial_id')
          })
        } else {
          localSystem.value = undefined
        }
      }).catch((error) => {
        // do something with the error
        $q.notify({
          color: 'negative',
          message: 'Error loading system dataset: ' + error,
          position: 'top',
          timeout: 5000
        });
      })
    }
  }
})

watch(() => selectedVariant.value, (value) => {
  if (value == 'circuit' || value == 'pollution') {
    selectedField.value = 'count'
  } else {
    selectedField.value = ''
    selectedLabel.value = ''
  }
})

function confirmData() {
  // based on variant, field, and label, grab the data and set it in 'reserved' for the chart
  // replace  reserved array altogether
  if (selectedVariant.value == 'item') {

    partialConfig.value = {
      variant: selectedVariant.value,
      label: selectedLabel.value,
      field: selectedField.value,
      hidden: false,
      borderColor: '#000000',
      tension: 0.1,
      data: localItemData.value.filter((d) => {
        return d.label == selectedLabel.value
      }).map((d) => {
        if (d)
          return d[selectedField.value] * (selectedField.value == 'prod' ? 1 : -1)
        else return 0
      })
    }
  } else if (selectedVariant.value == 'circuit') {
    partialConfig.value = {
      variant: selectedVariant.value,
      label: selectedLabel.value,
      field: selectedField.value,
      hidden: false,
      borderColor: '#000000',
      tension: 0.1,
      data: localCircuitData.value.filter((d) => {
        return d.label == selectedLabel.value
      }).map((d) => {
        if (d)
          return d[selectedField.value]
        else return 0
      })
    }
  } else if (selectedVariant.value == 'pollution') {
    partialConfig.value = {
      variant: selectedVariant.value,
      label: 'pollution',
      field: 'count',
      hidden: false,
      borderColor: '#000000',
      tension: 0.1,
      data: localPollutionData.value.map((d) => {
        if (d)
          return d.count
        else return 0
      })
    }
  } else if (selectedVariant.value == 'system') {
    partialConfig.value = {
      variant: selectedVariant.value,
      label: selectedField.value,
      field: selectedField.value,
      hidden: false,
      borderColor: '#000000',
      tension: 0.1,
      data: localSystemData.value.map((d) => {
        if (d)
          return d[selectedField.value]
        else return 0
      })
    }
  } else
    throw new Error('Invalid variant selected')

  dataLocked.value = true

}

//const reservedData = ref<any[]>([])
const partialConfig = ref<IChartDatasetConfig | undefined>()
const dataLocked = ref(false)

function filterItem (val, update) {
  if (val === '') {
    update(() => {
      return localItem.value?.uniqueLabels

      // here you have access to "ref" which
      // is the Vue reference of the QSelect
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    return localItem.value?.uniqueLabels.filter(v => v.toLowerCase().indexOf(needle) > -1)
  })
}

</script>

<template>
  <q-card class="popupSize">
    <!--    <q-card-section>-->
    <!--      <span class="text-h6">Add Line Chart</span>-->
    <!--    </q-card-section>-->
    <q-card-section v-if="props.data">
      <div class="row">
        <div class="col col-lg-4 col-md-6">
          <q-badge>REFERENCE</q-badge>
          <TrialBasicInfoCard :data="props.data"></TrialBasicInfoCard>
          <q-separator></q-separator>
          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label header>Usable Chart Data</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>
                  <q-chip>ITEM DATA</q-chip>
                </q-item-label>
              </q-item-section>
              <q-item-section v-if="localItem">
                <q-item-label>Records</q-item-label>
                <q-item-label caption>{{ localItem.records }}</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label>Unique Labels</q-item-label>
                <q-item-label caption>{{ localItem?.uniqueLabels.length }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>
                  <q-chip>CIRCUIT DATA</q-chip>
                </q-item-label>
              </q-item-section>
              <q-item-section v-if="localCircuit">
                <q-item-label>Records</q-item-label>
                <q-item-label caption>{{ localCircuit.records }}</q-item-label>
              </q-item-section>
              <q-item-section v-if="localCircuit">
                <q-item-label>Unique Labels</q-item-label>
                <q-item-label caption>{{ localCircuit?.uniqueLabels.length }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>
                  <q-chip>POLLUTION DATA</q-chip>
                </q-item-label>
              </q-item-section>
              <q-item-section v-if="localPollution">
                <q-item-label>Records</q-item-label>
                <q-item-label caption>{{ localPollution.records }}</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label>Unique Labels</q-item-label>
                <q-item-label caption>N/A</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>
                  <q-chip>SYSTEM DATA</q-chip>
                </q-item-label>
              </q-item-section>
              <q-item-section v-if="localSystem">
                <q-item-label>Records</q-item-label>
                <q-item-label caption>{{ localSystem.records }}</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label>Unique Labels</q-item-label>
                <q-item-label caption>{{ localSystem?.uniqueLabels.length }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <q-separator vertical></q-separator>
        <div class="col">
          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label><span class="text-h4">Add a new dataset</span></q-item-label>
                <q-item-label caption>Select data below, choose options, then save</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-select :disable="dataLocked" outlined label="Select Data Type" v-model="selectedVariant"
                          :options="['item', 'circuit', 'pollution', 'system']"></q-select>
              </q-item-section>
            </q-item>
            <q-item v-if="selectedVariant">
              <q-item-section side>
                <q-item-label>Label</q-item-label>
                <q-item-label caption>Choose the specific label to track</q-item-label>
              </q-item-section>
              <q-item-section v-if="selectedVariant == 'item'">
                <q-select
                          :disable="dataLocked" outlined label="Select Label" v-model="selectedLabel"
                          :options="localItem?.uniqueLabels"></q-select>
              </q-item-section>
              <q-item-section v-else-if="selectedVariant == 'circuit'">
                <q-select :disable="dataLocked" outlined label="Select Label" v-model="selectedLabel"
                          :options="localCircuit?.uniqueLabels"></q-select>
              </q-item-section>
              <q-item-section v-else-if="selectedVariant == 'pollution'">
                <q-item-label>No Label is required</q-item-label>
              </q-item-section>
              <q-item-section v-else-if="selectedVariant == 'system'">
                <q-item-label>No Label is required</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="selectedVariant && (selectedLabel || selectedVariant == 'pollution' || selectedVariant == 'system' )">
              <!--              If item is chosen, field options are 'prod' and 'cons'-->
              <!--              if circuit is chosen, field options are only 'count'. BUT, filter can be applied to signalType or color-->
              <!--              if pollution is chosen, field is set to 'count' and that's that-->
              <!--              if system is chosen, field can be any of the system data fields. Defaults to 'wholeUpdate'-->
              <q-item-section side>
                <q-item-label>Field</q-item-label>
                <q-item-label caption>Choose the field for Y axis</q-item-label>
              </q-item-section>
              <q-item-section v-if="selectedVariant == 'item'">
                <q-select :disable="dataLocked" outlined label="Select Field" v-model="selectedField"
                          :options="['prod', 'cons']"></q-select>
              </q-item-section>
              <q-item-section v-else-if="selectedVariant == 'circuit'">
                <q-select :disable="dataLocked" outlined label="Select Field" v-model="selectedField"
                          :options="['count']"></q-select>
              </q-item-section>
              <q-item-section v-else-if="selectedVariant == 'pollution'">
                <q-select :disable="dataLocked" outlined label="Select Field" v-model="selectedField"
                          :options="['count']"></q-select>
              </q-item-section>
              <q-item-section v-else-if="selectedVariant == 'system'">
                <q-select :disable="dataLocked" outlined label="Select Field" v-model="selectedField"
                          :options="localSystemDataOptions"></q-select>
              </q-item-section>
            </q-item>
            <q-separator v-if="selectedVariant && selectedField && (selectedLabel || selectedVariant == 'pollution' || selectedVariant == 'system' )" class="q-mt-sm q-mb-sm"></q-separator>
            <q-item v-if="selectedVariant && selectedField && (selectedLabel || selectedVariant == 'pollution' || selectedVariant == 'system' ) && !dataLocked">
              <q-item-section>
                <q-btn @click="confirmData()" size="lg" color="positive">CONFIRM</q-btn>
              </q-item-section>
            </q-item>
            <q-item v-if="dataLocked && partialConfig">
              <q-item-section>
                <TrialResultsChartConfig @chart="(dat) => emit('chart',dat)" v-model:chart="partialConfig" :data="props.data"></TrialResultsChartConfig>
              </q-item-section>
            </q-item>

          </q-list>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
</style>
