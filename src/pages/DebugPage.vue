<script setup lang="ts">

import {onMounted, ref} from "vue";
import {useDatasets} from "stores/datasets";
import {usePublicApi} from "stores/public-api";
import {ISource, ITrial} from "factorio-analytics";
import {useQuasar} from "quasar";
import TrialResultsChartBuilder from "components/TrialResultsChartBuilder.vue";
import TrialBasicInfoCard from "components/TrialBasicInfoCard.vue";
import TrialResultsMetadata from "components/TrialResultsMetadata.vue";

const datasets = useDatasets()
const api = usePublicApi();
const $q = useQuasar();

const exampleSourceId = '71e21694f4429bc0d86a2ed9d35dafd4b258623d5fff4d6c185f8434cd19e8f0'

const sourceMetadata = ref<ISource | undefined>()
const trialMetadata = ref<ITrial | undefined>()

const isSourceLoaded = ref<boolean>(false)
const isTrialLoaded = ref<boolean>(false)

const sourceError = ref<string>('')
const trialError = ref<string>('')

const recheckInterval = ref()
const viewTextLogs = ref(false)
const selectedTab = ref('item')

async function loadAllDatasets() {
  if (trialMetadata.value?.id) {
    await Promise.allSettled([
      datasets.loadDataset(trialMetadata.value?.id, 'item', trialMetadata.value?.tickInterval ?? 60),
      datasets.loadDataset(trialMetadata.value?.id, 'electric', trialMetadata.value?.tickInterval ?? 60),
      datasets.loadDataset(trialMetadata.value?.id, 'circuit', trialMetadata.value?.tickInterval ?? 60),
      datasets.loadDataset(trialMetadata.value?.id, 'pollution', trialMetadata.value?.tickInterval ?? 60),
      datasets.loadDataset(trialMetadata.value?.id, 'system', trialMetadata.value?.tickInterval ?? 60)
    ])
  }
}


function startTickUntilTrialIsDone() {
  // ticks every 15 seconds to check if trial is done yet
  if (!trialMetadata.value?.id) {
    return
  }

  recheckInterval.value = setInterval(() => {
    if (trialMetadata.value?.stage == 'analyzed') {
      clearInterval(recheckInterval.value)
    } else if (trialMetadata.value?.id) {
      api.loadTrial(trialMetadata.value?.id).then((data) => {
        trialMetadata.value = data
        if (data?.stage == 'analyzed') {
          loadAllDatasets().then(() => {
            isTrialLoaded.value = true
          })
        }

      }).catch((error) => {
        // do something with the error
        isTrialLoaded.value = true
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

onMounted(() => {
  if (exampleSourceId) {
    api.loadSource(exampleSourceId).then((data) => {
      sourceMetadata.value = data
      isSourceLoaded.value = true
    }).catch((error) => {
      // do something with the error
      isSourceLoaded.value = true
      sourceError.value = error
      $q.notify({
        color: 'negative',
        message: 'Error loading source: ' + error,
        position: 'top',
        timeout: 5000
      });
    })
    api.loadDefaultTrialForSource(exampleSourceId).then((data) => {
      trialMetadata.value = data
      if (trialMetadata.value?.stage != 'analyzed') {
        startTickUntilTrialIsDone()
      }
      if (trialMetadata.value?.id) {
        loadAllDatasets().then(() => {
          isTrialLoaded.value = true
        })
      }
      //loadedTrial.value = true
    }).catch((error) => {
      // do something with the error
      isTrialLoaded.value = true
      trialError.value = error
      $q.notify({
        color: 'negative',
        message: 'Error loading default trial for source: ' + error,
        position: 'top',
        timeout: 5000
      });
    })
  }
})

</script>

<template>
  <q-page v-if="trialMetadata?.stage == 'analyzed'" padding class="bg-grey-5">
    <div class="row"
         v-if="isTrialLoaded && trialMetadata">
      <q-card style="min-height: 50em;"
              class="col q-mr-lg q-mb-lg col-lg-5 col-md-5 col-sm-12 col-xs-12">
        <q-card-section>
          <TrialBasicInfoCard
            :data="trialMetadata"
          >

          </TrialBasicInfoCard>
          <q-btn @click="viewTextLogs = true" color="secondary" class="full-width">View Text Logs</q-btn>
          <q-dialog v-model="viewTextLogs">
            <q-card>
              <q-card-section>
                <q-list dense>
                  <q-item v-for="(log, idx) in trialMetadata.textLogs" :key="log">
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
        v-if="trialMetadata && (trialMetadata.itemMetadata?.total?.length > 0 || trialMetadata.circuitMetadata?.total?.length > 0 || (trialMetadata.electricMetadata?.avg && Object.keys(trialMetadata.electricMetadata.avg).length > 0))"
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
            :data="trialMetadata"
            :variant="selectedTab"
          />
        </q-card-section>
      </q-card>
      <q-card  class="col q-mb-lg" v-else-if="trialMetadata">
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
    <div v-if="trialMetadata && isTrialLoaded && (trialMetadata.itemMetadata?.total?.length > 0 || trialMetadata.circuitMetadata?.total?.length > 0 || trialMetadata.electricMetadata?.avg?.length > 0)" class="row q-gutter-lg">
      <!--div>chart master view component here</div-->
      <q-card class="col q-gutter-lg q-pt-lg">
        <q-card-section class="q-pt-sm q-mt-none q-pl-sm q-pr-sm">
          <TrialResultsChartBuilder
            :data="trialMetadata"  ></TrialResultsChartBuilder>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
  <q-page padding v-else>
    <q-card>
      <q-card-section class="text-center full-width">
        <span class="text-h5 text-bold text-uppercase">Blueprint running</span>
        <br />
        <span class="text-caption text-uppercase" v-if="trialMetadata">STAGE: {{trialMetadata?.stage}}</span>
      </q-card-section>
      <q-card-section>
        <q-linear-progress indeterminate class="full-width"></q-linear-progress>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped>

</style>
