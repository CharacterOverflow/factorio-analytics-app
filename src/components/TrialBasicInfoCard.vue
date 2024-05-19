<script setup lang="ts">
/*
* Will have all its data passed in directly, always used as a sub-component
* just render based on props
* */
import {ITrial} from "factorio-analytics";
import {date, copyToClipboard, useQuasar} from "quasar";
import {usePublicApi} from "stores/public-api";

const $q = useQuasar();
const api = usePublicApi()

const props = defineProps<{
  data: ITrial
}>()

function btnToClipboard(text: string | any) {
  if (text)
    copyToClipboard(text)
      .then(() => {
        // success!
        $q.notify({
          color: 'positive',
          message: 'Copied to clipboard',
          position: 'top',
          timeout: 2500
        });
      })
      .catch(() => {
        // fail
        $q.notify({
          color: 'negative',
          message: 'Failed to copy to clipboard',
          position: 'top',
          timeout: 2500
        });
      })
}

copyToClipboard('some text')
  .then(() => {
    // success!
  })
  .catch(() => {
    // fail
  })

</script>

<template>
  <q-list>
    <!--q-item>
      <q-item-section side>
        <q-badge style="{border-radius: 0}" icon-right="tag"
                 color="primary" class="q-pr-sm q-mr-none text-subtitle1">Trial ID
          <q-icon name="tag"></q-icon>
        </q-badge>
      </q-item-section>
      <q-item-section>
        <q-btn-group class="full-width rounded-borders">
          <q-btn @click="btnToClipboard(props.data.id)" class="col bg-grey-9" flat color="white">{{
              props.data?.id
            }}
          </q-btn>
          <q-btn @click="btnToClipboard(props.data.id)" flat color="white" class="bg-grey-9"
                 icon-right="copy_all"></q-btn>
        </q-btn-group>
      </q-item-section>
    </q-item-->
    <q-item>
<!--      <q-item-section side>-->
<!--        <q-badge style="{border-bottom-right-radius: 0; border-top-right-radius: 0 }" icon-right="tag"-->
<!--                 color="primary" class="q-pr-sm text-subtitle1">Source ID-->
<!--          <q-icon name="draw"></q-icon>-->
<!--        </q-badge>-->
<!--      </q-item-section>-->
      <q-item-section>
        <q-btn-group class="full-width rounded-borders">
          <q-badge style="border-top-right-radius: 0; border-bottom-right-radius: 0">BP</q-badge>
          <q-btn @click="btnToClipboard(props.data?.source)" class="col bg-grey-9" flat color="white">
<!--            We want to show as much of this on 1 line as we can, but it keeps wrapping. Make  it so it doesn't wrap
                and instead just cuts off with an ellipsis
-->
            <div class="ellipsis">
              {{ `${props.data?.source}`}}
            </div>

          </q-btn>
          <q-btn @click="btnToClipboard(props.data?.source)" flat color="white" class="bg-grey-8"
                 icon-right="copy_all">ID
            <q-tooltip>
              Copy ID to Share
            </q-tooltip>
          </q-btn>
          <q-btn v-if="api.sourceMap.get(props.data?.source)?.text" @click="btnToClipboard(api.sourceMap.get(props.data?.source)?.text)" flat color="white" class="bg-grey-8"
                 icon-right="segment">
            BP
            <q-tooltip>
              Copy BP to Use
            </q-tooltip>
          </q-btn>
        </q-btn-group>
      </q-item-section>
    </q-item>
    <q-item dense>
      <q-item-section>
        <q-item-label>
          <q-badge outline rounded color="black" class="q-pl-sm q-pr-sm full-width text-center text-caption">
            <div class="text-center full-width">Datasets to Record</div>
          </q-badge>
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <q-checkbox :model-value="props.data?.recordItems" label="ITEM"></q-checkbox>
      </q-item-section>
      <q-item-section>
        <q-checkbox :model-value="props.data?.recordElectric" label="ELEC"></q-checkbox>
      </q-item-section>
      <q-item-section>
        <q-checkbox :model-value="props.data?.recordCircuits" label="CIRC"></q-checkbox>
      </q-item-section>
      <q-item-section>
        <q-checkbox :model-value="props.data?.recordPollution" label="POLL"></q-checkbox>
      </q-item-section>
      <q-item-section>
        <q-checkbox :model-value="props.data?.recordSystem" label="SYS"></q-checkbox>
      </q-item-section>
    </q-item>
    <q-item dense>
      <q-item-section>
        <q-item-label>
          <q-badge outline rounded color="black" class="q-pl-sm q-pr-sm full-width text-center text-caption">
            <div class="text-center full-width">Trial Settings</div>
          </q-badge>
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section v-if="props.data?.length">
        <q-input :hint="`${props.data.length} ticks`"
                 :model-value="`${props.data?.length / (60 * 60)} minutes`" outlined label="Length" readonly></q-input>
      </q-item-section>
      <q-item-section v-if="props.data?.tickInterval" side>
        <q-input :hint="`Every ${props.data?.tickInterval} ticks`" :model-value="`Every ${(props.data?.tickInterval / 60)} seconds`"
                 outlined label="Interval (Ticks)" readonly></q-input>
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section v-if="props.data?.initialBots">
        <q-input :model-value="props.data?.initialBots" outlined label="Initial Bots" readonly
                 hint="Per roboport"></q-input>
      </q-item-section>
      <q-item-section v-if="props.data?.createdAt">
        <q-input :hint="''" :model-value="(props.data?.createdAt as string).replace('T',' ').slice(0, -5) " outlined
                 label="Created At" readonly></q-input>
      </q-item-section>
    </q-item>
    <q-separator></q-separator>
    <q-item class="text-center">
      <q-item-section>
        <q-item-label overline>IN MILLISECONDS</q-item-label>
        <q-item-label>Per-Tick Timing</q-item-label>
        <q-item-label caption>Time it took to process each frame</q-item-label>
      </q-item-section>
    </q-item>
    <q-item v-if="props.data?.metadata">
      <q-item-section>
        <q-btn-group class="full-width" flat disabled>
          <q-btn class="col" color="primary" >
            MIN
          </q-btn>
          <q-btn class="col" color="primary" >
            AVG
          </q-btn>
          <q-btn class="col" color="primary" >
            MAX
          </q-btn>
        </q-btn-group>
        <q-btn-group flat>
          <q-btn class="col" color="primary" >
            {{ (props.data?.metadata?.min).toFixed(2) }}
          </q-btn>
          <q-btn class="col" color="primary" >
            {{ (props.data?.metadata?.avg).toFixed(2) }}
          </q-btn>
          <q-btn class="col" color="primary" >
            {{ (props.data?.metadata?.max).toFixed(2) }}
          </q-btn>
        </q-btn-group>
      </q-item-section>
    </q-item>
    <q-separator></q-separator>
    <q-item class="text-center">
      <q-item-section>
        <q-item-label overline>IN SECONDS</q-item-label>
        <q-item-label>Overall Timing</q-item-label>
        <q-item-label caption>Time it took to process the entire trial</q-item-label>
      </q-item-section>
    </q-item>
    <q-item v-if="props.data?.metadata">
      <q-item-section>
        <q-btn-group class="full-width" flat disabled>
          <q-btn class="col" color="secondary" >
            TRIAL
          </q-btn>
          <q-btn class="col" color="secondary" >
            EXEC
          </q-btn>
          <q-btn class="col" color="secondary" >
            TOTAL
          </q-btn>
        </q-btn-group>
        <q-btn-group flat>
          <q-btn class="col" color="secondary" >
            {{ (props.data?.metadata?.trialTime / 1000).toFixed(2) }}
          </q-btn>
          <q-btn class="col" color="secondary" >
            {{ (props.data?.metadata?.execTime / 1000).toFixed(2) }}
          </q-btn>
          <q-btn class="col" color="secondary" >
            {{ (props.data?.metadata?.totalTime / 1000).toFixed(2) }}
          </q-btn>
        </q-btn-group>
      </q-item-section>
    </q-item>
    <q-item v-else>
      <q-item-section>Trial is still running</q-item-section>
    </q-item>
    <!--q-item>
      <q-item-section>
        <q-item-label class="text-caption">All 'rate' related statistics are normalized to a 60 tick (1 second)
          denominator
        </q-item-label>
        <q-item-label caption>AKA, all rates are <b>'ITEMS PER SECOND'</b></q-item-label>
      </q-item-section>
    </q-item-->
  </q-list>
</template>

<style scoped>
.q-btn .q-focus-helper {
  display: none;
}
</style>
