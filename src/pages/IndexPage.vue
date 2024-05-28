<template>
  <q-page padding>

    <q-card>
      <q-card-section>
        <div class="text-uppercase text-h6">
          About
        </div>
        <div class="text-body2">
          Factorio Analytics is a tool for analyzing all of the data produced by running a Blueprint in Factorio. All of
          the statistical data that you see in-game can be recorded and analyzed here; with some limits and caveats of
          course.
        </div>

        <div class="text-body2">
          Some things this tool can and can't do...
          <ul>
            <li>
              <q-icon name="check" color="green"></q-icon>
              Record and analyze production and consumption rates of item output
            </li>
            <li>
              <q-icon name="check" color="green"></q-icon>
              Record and analyze electric network data
            </li>
            <li>
              <q-icon name="check" color="green"></q-icon>
              Record and analyze the state of the circuit network
            </li>
            <li>
              <q-icon name="check" color="green"></q-icon>
              Record and analyze pollution data
            </li>
            <li>
              <q-icon name="check" color="green"></q-icon>
              Record and analyze system performance data
            </li>
            <li>
              <q-icon name="cancel" color="red"></q-icon>
              CANNOT Record screenshots of your blueprint as it runs
            </li>
            <li>
              <q-icon name="cancel" color="red"></q-icon>
              CANNOT Use mods (use the local factorio-analytics package yourself if anything)
            </li>
          </ul>
        </div>
        <div class="text-body2">
          There are some requirements you should know before submitting blueprints. These are important to keep in mind
          so that you can receive accurate data about what you want
          <ol>
            <li>Blueprints submitted must be in the latest Blueprint version <b><i>(AKA EXTREMELY OLD BLUEPRINTS NOT
              SUPPORTED)</i></b></li>
            <li>Blueprints must contain <b>AT LEAST 1 INFINITY CHEST OR 1 COMBINATOR</b> to produce any real amount of
              data.
              The benchmark world will be completely barren, so plan accordingly
            </li>
            <li>Blueprints submitted must contain ONLY Vanilla items. Yes, you CAN submit modded blueprints; but the
              functionality to download and use those mods is not done yet
            </li>
            <br>
            <b>One last tip: Try making smaller sub-factory pieces, with infinity-chests and infinity-pipes as
              inputs/outputs. These kinds of blueprints run very quick. Design different parts of your factory,
              benchmark them here, then decide on final factory designs in-game.
            </b>
          </ol>
        </div>
        <br>
        <div class="text-body2">
          See my Github page in the top right for more information on how this tool works, and how you can use it locally!
        </div>
      </q-card-section>
      <q-card-section>
        <div class="text-uppercase text-h6">
          ACTIONS
        </div>
      </q-card-section>
      <q-card-section>
        <q-item>
          <q-item-section style="max-width: 30%">
            <q-item-label>Open Blueprint</q-item-label>
            <q-item-label caption>Opens a specific blueprint by ID</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <q-input :debounce="1000" v-model="blueprintOpen" label="Blueprint ID" filled></q-input>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label>
              <q-btn color="primary" @click="onBlueprintID(blueprintOpen)">Open</q-btn>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section style="max-width: 30%">
            <q-item-label>Submit Blueprint and Trial</q-item-label>
            <q-item-label caption>Submit a blueprint with a default trial</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <q-input type="textarea" v-model="blueprintInput" label="Blueprint String" filled>
              </q-input>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn class="full-height q-ml-xl q-mt-lg q-mb-lg " color="primary"
                   :disable="!blueprintInput" @click="submitBlueprint()">Submit and Open
            </q-btn>
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {usePublicApi} from "stores/public-api";
import {useRouter} from "vue-router";
import {useQuasar} from "quasar";

const api = usePublicApi();
const rt = useRouter();
const $q = useQuasar();
//
// const trialOpen = ref<string>('');

const blueprintOpen = ref<string>('');
const blueprintInput = ref<string>('');

const blueprintOpenValid = ref<boolean>(false);

// function onTrialOpen() {
//   // load the trial information. from that, we load the page for the source in question
//   api.loadTrial(trialOpen.value).then((data) => {
//     if (!data?.id) {
//       $q.notify({
//         color: 'negative',
//         message: 'Trial not found',
//         position: 'top',
//         timeout: 2500
//       });
//       return;
//     }
//     rt.push(`/trial/${data.id}`)
//   }).catch((error) => {
//     $q.notify({
//       color: 'negative',
//       message: 'Error opening trial',
//       position: 'top',
//       timeout: 2500
//     });
//     console.log(error);
//   })
// }

function onBlueprintID(val) {
  // run the 'check' query for this ID - if valid, mark blueprintOpenValid
  blueprintOpen.value = val;
  api.checkSource(val).then((data) => {
    blueprintOpenValid.value = true;
    rt.push(`/source/${val}`)
  }).catch((error) => {
    // not valid - mark as false
    blueprintOpenValid.value = false;
  })
}

function submitBlueprint() {
  api.submitQuickSource(blueprintInput.value).then((data) => {
    // load the trial information. from that, we load the page for the source in question
    let trialId = data.trialId;

    api.queryTrial(trialId).then((data) => {
      rt.push(`/source/${data.source}`)
    }).catch((error) => {
      $q.notify({
        color: 'negative',
        message: 'Error opening blueprint',
        position: 'top',
        timeout: 2500
      });
      console.log(error);
    })
  }).catch((error) => {
    $q.notify({
      color: 'negative',
      message: 'Error submitting blueprint',
      position: 'top',
      timeout: 2500
    });
    console.log(error);
  })
}


</script>
