<script setup lang="ts">
import {usePublicApi} from "stores/public-api";
import {onMounted, ref} from "vue";
import {useQuasar} from "quasar";
import {ISource, ITrial} from "factorio-analytics";
import TrialBasicInfoCard from "components/TrialBasicInfoCard.vue";
import SourceBlueprintView from "components/SourceBlueprintView.vue";
import TrialResultsMetadata from "components/TrialResultsMetadata.vue";
import TrialResultsChartRender from "components/TrialResultsChartRender.vue";
import TrialResultsChartBuilder from "components/TrialResultsChartBuilder.vue";
import {IChartDatasetTemplate} from "components/ChartTypes";
import {useDatasets} from "stores/datasets";

const props = defineProps<{
  id: string
}>()

const api = usePublicApi();
const $q = useQuasar();
const datasets = useDatasets()

const SourceLocal = ref<ISource | undefined>()
const TrialLocal = ref<ITrial | undefined>()

onMounted(() => {
  if (props.id) {
    api.loadSource(props.id).then((data) => {
      SourceLocal.value = data
      loadedSource.value = true
    }).catch((error) => {
      // do something with the error
      loadedSource.value = true
      $q.notify({
        color: 'negative',
        message: 'Error loading source: ' + error,
        position: 'top',
        timeout: 5000
      });
    })
    api.loadDefaultTrialForSource(props.id).then((data) => {
      TrialLocal.value = data
      if (TrialLocal.value?.stage != 'analyzed') {
        startTickUntilTrialIsDone()
      }
      if (TrialLocal.value?.id) {
        Promise.allSettled([
          datasets.loadDataset(TrialLocal.value?.id, 'item', TrialLocal.value?.tickInterval ?? 60),
          datasets.loadDataset(TrialLocal.value?.id, 'electric', TrialLocal.value?.tickInterval ?? 60),
          datasets.loadDataset(TrialLocal.value?.id, 'circuit', TrialLocal.value?.tickInterval ?? 60),
          datasets.loadDataset(TrialLocal.value?.id, 'pollution', TrialLocal.value?.tickInterval ?? 60),
          datasets.loadDataset(TrialLocal.value?.id, 'system', TrialLocal.value?.tickInterval ?? 60)
        ]).then(() => {
          loadedTrial.value = true
        })
      }
      //loadedTrial.value = true
    }).catch((error) => {
      // do something with the error
      loadedTrial.value = true
      $q.notify({
        color: 'negative',
        message: 'Error loading default trial for source: ' + error,
        position: 'top',
        timeout: 5000
      });
    })
  }
})

const loadedSource = ref(false)
const loadedTrial = ref(false)
const hideMetadata = ref(false)

const selectedTab = ref('item')
const viewTextLogs = ref(false)
const loadingAmt = ref(0)
const interval = ref<any>()

const datasetTemplates = ref<IChartDatasetTemplate[]>([])

function setDatasetTemplates(arr: IChartDatasetTemplate[]) {
  datasetTemplates.value = arr
}

function startTickUntilTrialIsDone() {
  // ticks every 15 seconds to check if trial is done yet
  if (!TrialLocal.value?.id) {
    return
  }

  interval.value = setInterval(() => {
    if (TrialLocal.value?.stage == 'analyzed') {
      clearInterval(interval.value)
    } else {
      api.loadTrial(TrialLocal.value?.id).then((data) => {
        TrialLocal.value = data
        loadedTrial.value = true
        if (data.stage == 'new') {
          loadingAmt.value = .1
        } else if (data.stage == 'preparing' || data.stage == 'prepared') {
          loadingAmt.value = .25
        } else if (data.stage == 'compiling' || data.stage == 'compiled') {
          loadingAmt.value = .75
        } else if (data.stage == 'analyzed') {
          loadingAmt.value = 1
        } else
          loadingAmt.value = .75
      }).catch((error) => {
        // do something with the error
        loadedTrial.value = true
        $q.notify({
          color: 'negative',
          message: 'Error loading trial: ' + error,
          position: 'top',
          timeout: 5000
        });
      })
    }
  }, 15000)
}

// function onTemplateDatasetAdded(template: IChartDatasetTemplate) {
//   addDatasetTemplate(template.variant, template.label, template.field)
// }

</script>

<template>
  <q-page v-if="TrialLocal?.stage == 'analyzed'" padding class="bg-grey-5">
    <div class="row"
         v-if="loadedTrial && TrialLocal">
      <q-card style="min-height: 50em;"
              class="col q-mr-lg q-mb-lg col-lg-5 col-md-5 col-sm-12 col-xs-12">
        <q-card-section>
          <TrialBasicInfoCard
            :data="TrialLocal"
          >

          </TrialBasicInfoCard>
          <q-btn @click="viewTextLogs = true" color="secondary" class="full-width">View Text Logs</q-btn>
          <q-dialog v-model="viewTextLogs">
            <q-card>
              <q-card-section>
                <q-list dense>
                  <q-item v-for="(log, idx) in TrialLocal.textLogs" :key="log">
                    <q-item-section side>
                      <q-badge>
                        {{idx}}
                      </q-badge>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{log}}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-dialog>
        </q-card-section>
      </q-card>
      <q-card
        v-if="!hideMetadata && loadedTrial && (TrialLocal.itemMetadata?.total?.length > 0 || TrialLocal.circuitMetadata?.total?.length > 0 || (TrialLocal.electricMetadata?.avg && Object.keys(TrialLocal.electricMetadata.avg).length > 0))"
        class="col q-mb-lg">
        <q-card-section>
          <q-tabs active-color="white" active-bg-color="secondary" align="left" dense v-model="selectedTab">
            <q-badge icon-right="tag"
                     color="secondary" class="q-pr-sm q-mr-md text-subtitle1">METADATA
              <q-icon class="q-pl-xs" name="summarize"></q-icon>
            </q-badge>
            <q-tab name="item" label="Items"/>
            <q-tab name="electric" label="Electric"></q-tab>
            <q-tab name="circuit" label="Circuits"/>
            <q-tab name="pollution" label="Pollution"/>
            <q-tab name="system" label="System"/>
          </q-tabs>
          <TrialResultsMetadata
            :datasets="datasetTemplates"
            @datasets="(ds) => {setDatasetTemplates(ds)}"
            :data="TrialLocal"
            :variant="selectedTab"
          />
        </q-card-section>
      </q-card>
      <q-card  class="col q-mb-lg" v-else-if="!hideMetadata && loadedTrial">
        <q-card-section>
          <div class="text-h5">Please Verify your Blueprint</div>
          <div class="text-caption">No metadata found. Something went wrong</div>
        </q-card-section>
        <q-card-section>
          <q-list>
            <q-item>
              <q-item-section side avatar>
                <q-icon color="negative" name="warning"></q-icon>
              </q-item-section>
              <q-item-section>
                <q-item-label overline>Item Metadata not found</q-item-label>
                <q-item-label>No item or circuit results were found, but the trial did run. Check that your blueprint has required electric-energy-interfaces (infinity power) and infinity chests to function. Submit a new blueprint after you have done so</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
    <div v-if="TrialLocal && loadedTrial && (TrialLocal.itemMetadata?.total?.length > 0 || TrialLocal.circuitMetadata?.total?.length > 0 || TrialLocal.electricMetadata?.avg?.length > 0)" class="row q-gutter-lg">
      <!--div>chart master view component here</div-->
      <q-card class="col q-gutter-lg q-pt-lg">
        <q-card-section class="q-pt-sm q-mt-none q-pl-sm q-pr-sm">
          <TrialResultsChartBuilder
            @templates="(ds) => {setDatasetTemplates(ds)}"
            :templates="datasetTemplates"
            :data="TrialLocal" ></TrialResultsChartBuilder>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
  <q-page padding v-else>
    <q-card>
      <q-card-section class="text-center full-width">
        <span class="text-h5 text-bold text-uppercase">Blueprint running</span>
        <br />
        <span class="text-caption text-uppercase" v-if="TrialLocal">STAGE: {{TrialLocal?.stage}}</span>
      </q-card-section>
      <q-card-section>
        <q-linear-progress indeterminate v-model:value="loadingAmt" class="full-width"></q-linear-progress>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped>

</style>
