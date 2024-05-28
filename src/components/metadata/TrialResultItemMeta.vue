<script setup lang="ts">

import {computed, onMounted, PropType, ref} from "vue";
import {ITrial} from "factorio-analytics";
import {useDatasets} from "stores/datasets";

const datasets = useDatasets()

const props = defineProps({
  data: {
    type: Object as PropType<ITrial>,
    required: true
  }
})

const columns = ref<any[]>([
  {
    name: 'item',
    label: 'Item',
    align: 'left',
    field: 'item',
    sortable: true
  },
  {
    name: 'prod',
    label: 'Production TOTAL (AVG)',
    align: 'center',
    field: 'prod',
    sortable: true
  },
  {
    name: 'cons',
    label: 'Consumption TOTAL (AVG)',
    align: 'center',
    field: 'prod',
    sortable: true,
  }
]);
const rows = ref<any[]>([]);

const filterInput = ref<string>('');
const lastSort = ref<string>('');

function processMetadata() {
  // this function will identify and fill any/all needed buffers to display the metadata
  // go through the 'avg' array, unique by label, and populate a new array
  // at the end, fill the 'rows' array with the new array
  if (props.data?.itemMetadata) {
    let newRows = []
    let avg = props.data.itemMetadata.avg
    for (let i = 0; i < avg.length; i++) {
      let item = avg[i]
      // find this item in the 'total' array as  well if it exists. cannot assume same index!
      let foundItem = props.data.itemMetadata.total.find((x) => x.label == item.label)

      let newItem = {
        item: item.key,
        avgProd: item.value.prod,
        avgCons: item.value.cons,
        totalProd: foundItem?.value?.prod ?? 0,
        totalCons: foundItem?.value?.cons ?? 0
      }
      newRows.push(newItem)
    }
    rows.value = newRows
  }
}

onMounted(() => {
  if (props.data?.itemMetadata?.avg) {
    processMetadata()
  }
})

/*
* What if i didnt have a metadata section?
* instead, show a big table of all metadata. Would need full-width
* can fill-in the current width with more information about the project and data displayed. aka help section
* ]*/

</script>

<template>
<!--  <q-item dense v-if="props.data?.itemMetadata?.avg">-->
<!--    <q-item-section>-->
<!--      <q-input label="Item" filled dense v-model="filterInput"></q-input>-->
<!--    </q-item-section>-->
<!--    <q-item-section class="col-3 text-center">-->
<!--      <q-btn-->
<!--        :icon-right="lastSort == 'PROD:DESC' ? 'expand_more' : ( lastSort == 'PROD:ASC' ? 'expand_less' : undefined)"-->
<!--        @click="clickSortItemProd()" size="sm" dense text-color="white" color="positive">-->
<!--        <b class="text-weight-bolder text-body2">PROD</b>-->
<!--      </q-btn>-->
<!--    </q-item-section>-->
<!--    <q-item-section class="col-3 text-center">-->
<!--      <q-btn-->
<!--        :icon-right="lastSort == 'CONS:DESC' ? 'expand_more' : ( lastSort == 'CONS:ASC' ? 'expand_less' : undefined)"-->
<!--        @click="clickSortItemCons()" size="sm" dense text-color="white" color="negative">-->
<!--        <b class="text-weight-bolder text-body2">CONS</b>-->
<!--      </q-btn>-->
<!--    </q-item-section>-->
<!--  </q-item>-->
<!--  <q-item v-else>-->
<!--    <q-item-section>-->
<!--      <q-item-label>-->
<!--        <q-badge class="full-width text-center" style="min-height: 1.75em" text-color="white" color="red-10">-->
<!--          <div class="full-width text-weight-bolder">-->
<!--            NO DATA-->
<!--          </div>-->
<!--        </q-badge>-->
<!--      </q-item-label>-->
<!--    </q-item-section>-->
<!--  </q-item>-->
  <q-table
    flat
    :table-style="{
      maxHeight: '50em'
    }"
    virtual-scroll
    class="full-width"
    :rows="rows"
    :columns="columns"
    :rows-per-page-options="[0]"
    row-key="item"
  >
    <template v-slot:body-cell-prod="scope">
      <q-td :props="scope.props">
        <div class="text-left">
          <span class="text-body1 q-pr-sm">{{ scope.row.totalProd.toFixed(0) }}</span>
          <q-badge>{{ scope.row.avgProd.toFixed(2) }}</q-badge>
        </div>
      </q-td>
    </template>
    <template v-slot:body-cell-cons="scope">
      <q-td :props="scope.props">
        <div class="text-center">
          {{ scope.row.totalCons.toFixed(2) }}
        </div>
      </q-td>
    </template>

  </q-table>
</template>

<style scoped>

</style>
