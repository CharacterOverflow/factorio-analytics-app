<script setup lang="ts">
import {usePublicApi} from "stores/public-api";
import {computed, onMounted, ref} from "vue";
import {useQuasar} from "quasar";
import TrialBasicInfoCard from "components/TrialBasicInfoCard.vue";
import SourceRender from "components/SourceRender.vue";
import TrialResultsMetadata from "components/TrialResultsMetadata.vue";
import TrialSourceChartsView from "components/TrialSourceChartsView.vue";

const props = defineProps<{
  id: string
}>()

const testme = 'testme'

const api = usePublicApi();
const $q = useQuasar();

const loaded = ref(false)

// if trialData is null, need to load trial. if still null, trial doesn't exist
const trialData = computed(() => {
  return api.trialMap.get(props.id)
})

onMounted(() => {
  if (props.id) {
    api.loadTrial(props.id).then(() => {
      loaded.value = true
    }).catch((error) => {
      // do something with the error
      $q.notify({
        color: 'negative',
        message: 'Error loading trial',
        position: 'top',
        timeout: 2500
      });
    })
  }
})

const hideMetadata = ref(false)

</script>

<template>
  <q-page padding>
    <div class="row q-gutter-lg"
         v-if="loaded && trialData">
      <TrialBasicInfoCard
        class="infoCard"
        :data="trialData"
      >

      </TrialBasicInfoCard>
    </div>
    <div class="row q-gutter-lg q-pt-lg">
      <q-card class="col">
        <q-card-section>
          <span class="text-subtitle2">Settings and Options</span>
          <q-checkbox v-model="hideMetadata" label="Hide metadata"/>
        </q-card-section>
      </q-card>
    </div>
    <div v-if="!hideMetadata && loaded" class="row q-gutter-lg q-pt-lg">
      <TrialResultsMetadata
        class="col col-sm-6 col-md-4 col-lg-3"
        :data="trialData"
        variant="ITEM"
      />
      <!--TrialResultsMetadata
        class="col"
        :data="trialData"
        variant="ELEC"
      /-->
      <TrialResultsMetadata
        class="col-4 col-md-3 col-lg-2"
        :data="trialData"
        variant="CIRC"
      />
      <TrialResultsMetadata
        class="col col-sm-6 col-md-4 col-lg-3"
        :data="trialData"
        variant="POLL"
      />
      <TrialResultsMetadata
        class="col-5 col-sm-5 col-md-5 col-lg-3"
        :data="trialData"
        variant="SYS"
      />
    </div>
    <q-banner @click="hideMetadata = false" v-if="hideMetadata && loaded && trialData" class="q-mt-lg bg-secondary rounded-borders shadow-2">
      <div class="text-overline text-uppercase text-white"><q-icon size="md" name="expand_less"></q-icon>Metadata hidden</div>
    </q-banner>
    <div class="row q-gutter-lg q-pt-lg">
      <q-card class="col">
        <q-card-section>
          <q-badge style="{border-bottom-right-radius: 0; border-top-right-radius: 0 }" icon-right="tag"
                   color="primary"
                   class="q-pr-sm text-subtitle1">Datasets
          </q-badge>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>

.infoCard {
  width: 35%;
}

</style>
