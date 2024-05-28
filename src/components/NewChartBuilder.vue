<script setup lang="ts">

import {onMounted, PropType, ref} from "vue";
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
  processMetadata()
})

</script>

<template>
  <div>
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
    <div>
      show chart here
    </div>
    <div>
      <q-list>
        <q-item v-for="(template, idx) in datasets.chartData" :key="idx">
          <q-item-section>
            <q-item-label overline>{{template.variant}}</q-item-label>
            <q-item-label>{{template.label}} | {{template.field}}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-input
              filled
              v-model="template.borderColor"
              class="my-input"
            >
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color  v-model="template.borderColor"/>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-item-section>
          <q-item-section>

          </q-item-section>
          <q-item-section side>
            <q-btn color="primary" >test</q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<style scoped>

</style>
