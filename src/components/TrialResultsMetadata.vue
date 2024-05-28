<script setup lang="ts">
/*
* This component is responsible for showing the metadata of a given trial
* Can only show a single 'metadata' topic (items, elec, circ, etc) at a time
* By having this component be able to render any metadata depending on type, we
* can just use multiple instances of this component
* */

import {ITrial} from "factorio-analytics";
import {computed, ref, type PropType, onMounted, watch} from "vue";
import {IChartDatasetTemplate} from "components/ChartTypes";
import {useDatasets} from "stores/datasets";

// define a type that can be used for the Vue 3 props below typescript setup
// the type should have options 'ITEM', 'ELEC', 'CIRC', 'POLL', 'SYS', 'ALL'

//type MetadataType = 'ITEM' | 'ELEC' | 'CIRC' | 'POLL' | 'SYS' | 'ALL'
const props = defineProps({
  data: {
    type: Object as PropType<ITrial>,
    required: true
  },
  variant: {
    type: String, //MetadataType,
    required: true
  }
})

const emit = defineEmits(['datasets'])

// watch the variant prop - on changing, refresh
watch(() => props.variant, () => {
  refreshMetadata()
})

const selectedCategory = ref<string>('')
const categoryOrDefault = computed({
  get: () => {
    if (selectedCategory.value != null && selectedCategory.value != '') {
      return selectedCategory.value
    } else {
      if (modeOptions.value && modeOptions.value.length > 0)
        return modeOptions.value[0].value
      else
        return ''
    }
  },
  set: (val: string) => selectedCategory.value = val
})
const modeOptions = computed(() => {
  // based on the props.variant, return the correct options
  if (props.variant == 'item') {
    return [
      {label: 'Average', value: 'avg'},
      {label: 'Total', value: 'total'}
    ]
  } else if (props.variant == 'electric') {
    return [
      {label: 'Average', value: 'avg'},
      {label: 'Minimum', value: 'min'},
      {label: 'Maximum', value: 'max'}
    ]
  }
  else if (props.variant == 'circuit') {
    return [
      {label: 'Networks', value: 'networks'},
      {label: 'Signals', value: 'signals'}
    ]
  } else
    return [
      {label: 'Summary', value: 'disable'}
    ]
})

// save local copies for all data being used
const metadata = ref<any>({});
const metadataBak = ref<any>({});

onMounted(() => {
  refreshMetadata()
})

function refreshMetadata() {
  if (props.variant == 'item' && props.data?.itemMetadata) {
    metadata.value = props.data.itemMetadata
    metadataBak.value = props.data?.itemMetadata
    clickSortItemProd()
  } else if (props.variant == 'electric' && props.data?.electricMetadata) {
    metadata.value = props.data.electricMetadata
    metadataBak.value = props.data.electricMetadata
  } else if (props.variant == 'circuit' && props.data?.circuitMetadata) {
    metadata.value = props.data.circuitMetadata
    metadataBak.value = props.data.circuitMetadata
  } else if (props.variant == 'pollution' && props.data?.pollutionMetadata) {
    metadata.value = props.data.pollutionMetadata
    metadataBak.value = props.data.pollutionMetadata
  } else if (props.variant == 'system' && props.data?.systemMetadata) {
    metadata.value = props.data.systemMetadata
    metadataBak.value = props.data.systemMetadata
    clickSortSys('avg')
  }
}

const lastSort = ref<string>('')

function clickSortItemProd() {
  // this function needs to also filter out items that don't have the filter substring in them
  const cat = categoryOrDefault.value
  let md = JSON.parse(JSON.stringify(metadataBak.value))

  // md here needs to go into md[0].key for the description
  if (filterInput.value != '')
    md[cat] = md[cat].filter((item: any) => item.key.toLowerCase().includes(filterInput.value.toLowerCase()))

  if (!(md[cat] || md[cat]?.length > 0)) {
    throw new Error('No metadata to sort')
  }
  // based on last sort, set new sort
  if (lastSort.value == 'PROD:DESC') {
    md[cat] = md[cat].sort((a: any, b: any) => a.value.prod - b.value.prod)
    lastSort.value = 'PROD:ASC'
  } else if (lastSort.value == 'PROD:ASC') {
    md[cat] = md[cat].sort((a: any, b: any) => b.value.prod - a.value.prod)
    lastSort.value = 'PROD:DESC'
  } else {
    // we had something else entirely selected, so we default to DESC here
    lastSort.value = 'PROD:DESC'
    md[cat] = md[cat].sort((a: any, b: any) => b.value.prod - a.value.prod)
  }


  metadata.value = md;
}

function clickSortItemCons() {
  const cat = categoryOrDefault.value
  let md = metadataBak.value

  if (filterInput.value != '')
    md[cat] = md[cat].filter((item: any) => item.key.toLowerCase().includes(filterInput.value.toLowerCase()))

  if (!(md[cat] || md[cat].length > 0)) {
    throw new Error('No metadata to sort')
  }
  // based on last sort, set new sort
  if (lastSort.value == 'CONS:DESC') {
    md[cat] = md[cat].sort((a: any, b: any) => a.value.cons - b.value.cons)
    lastSort.value = 'CONS:ASC'
  } else if (lastSort.value == 'CONS:ASC') {
    md[cat] = md[cat].sort((a: any, b: any) => b.value.cons - a.value.cons)
    lastSort.value = 'CONS:DESC'
  } else {
    // we had something else entirely selected, so we default to DESC here
    lastSort.value = 'CONS:DESC'
    md[cat] = md[cat].sort((a: any, b: any) => b.value.cons - a.value.cons)
  }

  metadata.value = md;
}

function clickSortElectricProd() {
  // this function needs to also filter out items that don't have the filter substring in them
  const cat = categoryOrDefault.value
  let md = Object.keys(metadataBak.value[cat]).map(key => {
    return {key: key, value: metadataBak.value[cat][key]}
  })

  // md here needs to go into md[0].key for the description
  if (filterInput.value != '')
    md = md.filter((item: any) => item.key.toLowerCase().includes(filterInput.value.toLowerCase()))

  if (!(md || md?.length > 0)) {
    throw new Error('No metadata to sort')
  }
  // based on last sort, set new sort
  if (lastSort.value == 'PROD:DESC') {
    md = md.sort((a: any, b: any) => a.value.prod - b.value.prod)
    lastSort.value = 'PROD:ASC'
  } else if (lastSort.value == 'PROD:ASC') {
    md = md.sort((a: any, b: any) => b.value.prod - a.value.prod)
    lastSort.value = 'PROD:DESC'
  } else {
    // we had something else entirely selected, so we default to DESC here
    lastSort.value = 'PROD:DESC'
    md = md.sort((a: any, b: any) => b.value.prod - a.value.prod)
  }

  // something is very wrong here. not returning correct datatype
  metadata.value = md;
}

function clickSortElectricCons() {
  const cat = categoryOrDefault.value
  let md = Object.keys(metadataBak.value[cat]).map(key => {
    return {key: key, value: metadataBak.value[cat][key]}
  })

  if (filterInput.value != '')
    md = md.filter((item: any) => item.key.toLowerCase().includes(filterInput.value.toLowerCase()))

  if (!(md || md?.length > 0)) {
    throw new Error('No metadata to sort')
  }
  // based on last sort, set new sort
  if (lastSort.value == 'CONS:DESC') {
    md = md.sort((a: any, b: any) => a.value.cons - b.value.cons)
    lastSort.value = 'CONS:ASC'
  } else if (lastSort.value == 'CONS:ASC') {
    md = md.sort((a: any, b: any) => b.value.cons - a.value.cons)
    lastSort.value = 'CONS:DESC'
  } else {
    // we had something else entirely selected, so we default to DESC here
    lastSort.value = 'CONS:DESC'
    md = md.sort((a: any, b: any) => b.value.cons - a.value.cons)
  }

  metadata.value = md;
}

function clickSortSys(field: string) {
  // no categories to choose. instead, we sort the entire metadata (which is an array in this context)
  // the field chooses which field we sort by in the metadata array of objects
  // based on the last sort, different sorts are chosen as well
  let md = metadataBak.value

  // sys we want the 'key' value
  if (filterInput.value != '')
    md = md.filter((item: any) => item.key.toLowerCase().includes(filterInput.value.toLowerCase()))

  if (lastSort.value == `${field}:DESC`) {
    md = md.sort((a: any, b: any) => a[field] - b[field])
    lastSort.value = `${field}:ASC`
  } else if (lastSort.value == `${field}:ASC`) {
    md = md.sort((a: any, b: any) => b[field] - a[field])
    lastSort.value = `${field}:DESC`
  } else {
    // we had something else entirely selected, so we default to DESC here
    md = md.sort((a: any, b: any) => b[field] - a[field])
    lastSort.value = `${field}:DESC`
  }
  metadata.value = md;
}

function reapplySort() {
  // reapply the last sort
  switch (lastSort.value) {
    case 'PROD:DESC':
      lastSort.value = '';
      if (props.variant == 'item')
        clickSortItemProd()
      else if (props.variant == 'electric')
        clickSortElectricProd()
      break
    case 'PROD:ASC':
      lastSort.value = 'PROD:DESC';
      if (props.variant == 'item')
        clickSortItemProd()
      else if (props.variant == 'electric')
        clickSortElectricProd()
      break
    case 'CONS:DESC':
      lastSort.value = '';
      if (props.variant == 'item')
        clickSortItemCons()
      else if (props.variant == 'electric')
        clickSortElectricCons()
      break
    case 'CONS:ASC':
      lastSort.value = 'CONS:DESC';
      if (props.variant == 'item')
        clickSortItemCons()
      else if (props.variant == 'electric')
        clickSortElectricCons()
      break
    case 'avg:DESC':
      lastSort.value = '';
      clickSortSys('avg')
      break
    case 'avg:ASC':
      lastSort.value = 'avg:DESC';
      clickSortSys('avg')
      break
    case 'min:DESC':
      lastSort.value = '';
      clickSortSys('min')
      break
    case 'min:ASC':
      lastSort.value = 'min:DESC';
      clickSortSys('min')
      break
    case 'max:DESC':
      lastSort.value = '';
      clickSortSys('max')
      break
    case 'max:ASC':
      lastSort.value = 'max:DESC';
      clickSortSys('max')
      break
    default:
      break
  }
}

const _filterInput = ref<string>('')
const filterInput = computed({
  get: () => _filterInput.value,
  set: (val: string) => {
    _filterInput.value = val
    reapplySort()
  }
})

const datasets = useDatasets();

function addDatasetTemplate(variant: string, label: string, field: string) {
  // lets find the data we need for this

  datasets.addDatasetToChart({variant: variant, label: label, field: field, borderColor: '#000', data: []})
}

</script>

<template>
  <div>
    <q-card-section v-if="props.variant == 'item' && metadata?.total">
      <span>All Item data is per-second. Click '+' to add respective data to chart</span>
      <q-badge color="secondary" class="rounded-top q-pl-sm q-pr-sm full-width text-center text-caption">
        <div class="text-center full-width">Item Metadata</div>
        <q-tooltip class="bg-primary" anchor="top middle" self="bottom middle" :offset="[10, 10]">
          <q-badge>Make sure you include an Infinity chest and functionality for your blueprint to operate!</q-badge>
        </q-tooltip>
      </q-badge>
      <q-btn-toggle
        spread
        dense
        color="secondary"
        class="rounded-bottom"
        v-model="categoryOrDefault"
        toggle-color="primary"
        :options="modeOptions"
      />
      <div
        class="bg-blue-grey-2">
        <q-item dense v-if="metadata[categoryOrDefault]?.length > 0 || filterInput != ''">
          <q-item-section>
            <q-input label="Item" filled dense v-model="filterInput"></q-input>
          </q-item-section>
          <q-item-section class="col-3 text-center">
            <q-btn
              :icon-right="lastSort == 'PROD:DESC' ? 'expand_more' : ( lastSort == 'PROD:ASC' ? 'expand_less' : undefined)"
              @click="clickSortItemProd()" size="sm" dense text-color="white" color="positive">
              <b class="text-weight-bolder text-body2">PROD</b>
            </q-btn>
          </q-item-section>
          <q-item-section class="col-3 text-center">
            <q-btn
              :icon-right="lastSort == 'CONS:DESC' ? 'expand_more' : ( lastSort == 'CONS:ASC' ? 'expand_less' : undefined)"
              @click="clickSortItemCons()" size="sm" dense text-color="white" color="negative">
              <b class="text-weight-bolder text-body2">CONS</b>
            </q-btn>
          </q-item-section>
        </q-item>
        <q-item v-else>
          <q-item-section>
            <q-item-label>
              <q-badge class="full-width text-center" style="min-height: 1.75em" text-color="white" color="red-10">
                <div class="full-width text-weight-bolder">
                  NO DATA
                </div>
              </q-badge>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-separator class="q-mb-md q-mt-none"></q-separator>
        <q-virtual-scroll
          v-if="metadata[categoryOrDefault]"
          style="max-height: 40em; min-height: 36em"
          :items="metadata[categoryOrDefault]"
          v-slot="{item, idx}"
        >
          <q-item :key="idx">
            <!--q-item-section avatar side>
              <q-icon name="help"></q-icon>
            </q-item-section-->
            <q-item-section>
              <q-item-label class="text-uppercase">
                {{ item.key }}
              </q-item-label>
            </q-item-section>
            <q-item-section class="col-3 text-center">

              <q-btn-group text-color="white" color="positive">
                <q-btn color="positive" class="full-width text-weight-bolder numericValueClass">
                  {{item.value.prod.toFixed(1) }}
                </q-btn>
                <q-btn @click="addDatasetTemplate('item',item.key, 'prod')" color="primary" icon-right="add">
                  <q-tooltip>
                    Add to Chart
                  </q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-item-section>
            <q-item-section class="col-3 text-center">

              <q-btn-group text-color="white" color="negative">
                <q-btn color="negative" class="full-width text-weight-bolder numericValueClass">
                  {{-1 * item.value.cons.toFixed(1) }}
                </q-btn>
                <q-btn @click="addDatasetTemplate('item',item.key, 'cons')" color="primary" icon-right="add">
                  <q-tooltip>
                    Add to Chart
                  </q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-item-section>
          </q-item>
        </q-virtual-scroll>
      </div>
    </q-card-section>
    <q-card-section v-else-if="props.variant == 'electric' && metadata">
      <q-badge color="secondary" class="rounded-top q-pl-sm q-pr-sm full-width text-center text-caption">
        <div class="text-center full-width">Electricity Metadata</div>
      </q-badge>
      <q-btn-toggle
        spread
        dense
        color="secondary"
        class="rounded-bottom"
        v-model="categoryOrDefault"
        toggle-color="primary"
        :options="modeOptions"
      />
      <div
        class="bg-blue-grey-2">
        <q-item dense v-if="(metadata[categoryOrDefault] && Object.keys(metadata[categoryOrDefault])?.length > 0) || filterInput != ''">
          <q-item-section>
            <q-input label="Item" filled dense v-model="filterInput"></q-input>
          </q-item-section>
          <q-item-section class="col-4 text-center">
            <q-btn
              :icon-right="lastSort == 'PROD:DESC' ? 'expand_more' : ( lastSort == 'PROD:ASC' ? 'expand_less' : undefined)"
              @click="clickSortElectricProd()" size="sm" dense text-color="white" color="positive">
              <b class="text-weight-bolder text-body2">PROD</b>
            </q-btn>
          </q-item-section>
          <q-item-section class="col-4 text-center">
            <q-btn
              :icon-right="lastSort == 'CONS:DESC' ? 'expand_more' : ( lastSort == 'CONS:ASC' ? 'expand_less' : undefined)"
              @click="clickSortElectricCons()" size="sm" dense text-color="white" color="negative">
              <b class="text-weight-bolder text-body2">CONS</b>
            </q-btn>
          </q-item-section>
        </q-item>
        <q-item v-else>
          <q-item-section>
            <q-item-label>
              <q-badge class="full-width text-center" style="min-height: 1.75em" text-color="white" color="red-10">
                <div class="full-width text-weight-bolder">
                  NO DATA
                </div>
              </q-badge>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-separator class="q-mb-md q-mt-none"></q-separator>
        <q-virtual-scroll
          v-if="metadata[categoryOrDefault] && Object.keys(metadata[categoryOrDefault])?.length > 0"
          style="max-height: 40em; min-height: 36em"
          :items="Object.keys(metadata[categoryOrDefault]).map(key => {
            return {key: key, value: metadata[categoryOrDefault][key]}
          })"
          v-slot="{item, idx}"
        >
          <q-item :key="idx">
            <!--q-item-section avatar side>
              <q-icon name="help"></q-icon>
            </q-item-section-->
            <q-item-section>
              <q-item-label class="text-uppercase">
                {{ item.key }}
              </q-item-label>
            </q-item-section>
            <q-item-section class="col-3 text-center">

              <q-btn-group text-color="white" color="positive">
                <q-btn color="positive" class="full-width text-weight-bolder numericValueClass">
                  {{item.value.prod.toFixed(1) }}
                </q-btn>
                <q-btn @click="addDatasetTemplate('electric',item.key, 'prod')" color="primary" icon-right="add">
                  <q-tooltip>
                    Add to Chart
                  </q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-item-section>
            <q-item-section class="col-3 text-center">

              <q-btn-group text-color="white" color="negative">
                <q-btn color="negative" class="full-width text-weight-bolder numericValueClass">
                  {{-1 * item.value.cons.toFixed(1) }}
                </q-btn>
                <q-btn @click="addDatasetTemplate('electric',item.key, 'cons')" color="primary" icon-right="add">
                  <q-tooltip>
                    Add to Chart
                  </q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-item-section>
          </q-item>
        </q-virtual-scroll>
      </div>
    </q-card-section>
    <q-card-section v-else-if="props.variant == 'circuit' && metadata?.networks">
      <span>All Circuit data is as-of the specific point in time</span>
      <q-badge color="secondary" class="rounded-top q-pl-sm q-pr-sm full-width text-center text-caption">
        <div class="text-center full-width">Circuit Metadata</div>
        <q-tooltip class="bg-primary" anchor="top middle" self="bottom middle" :offset="[10, 10]">
          <q-badge>Circuit data can get complex; Download the raw data for more detail</q-badge>
        </q-tooltip>
      </q-badge>
      <q-btn-toggle
        spread
        dense
        color="secondary"
        class="rounded-bottom"
        v-model="categoryOrDefault"
        toggle-color="primary"
        :options="modeOptions"
      />
      <div
        class="bg-blue-grey-2">
        <span><i>More features coming soon with circuits</i></span>
        <q-item v-if="!(metadata[categoryOrDefault]?.length > 0)">
          <q-item-section>
            <q-item-label>
              <q-badge class="full-width text-center" style="min-height: 1.75em" text-color="white" color="red-10">
                <div class="full-width text-weight-bolder">
                  NO DATA
                </div>
              </q-badge>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-separator class="q-mb-md q-mt-none"></q-separator>
        <q-virtual-scroll
          v-if="metadata[categoryOrDefault]"
          style="max-height: 40em; min-height: 20em"
          :items="metadata[categoryOrDefault]"
          v-slot="{item, idx}"
        >
          <q-item :key="idx">
            <q-item-section v-if="item?.network">
              <q-item-label>
                <q-badge class="full-width text-center" style="min-height: 1.75em" color="teal-9" text-color="white">
                  <div class="full-width text-weight-bolder">
                    NETWORK ID {{ item.network }}
                  </div>
                </q-badge>
              </q-item-label>
            </q-item-section>
            <q-item-section v-if="item?.network">
              <q-item-label>
                <q-badge class="full-width text-center" style="min-height: 1.75em" color="green-9" text-color="white">
                  <div class="full-width
                  text-weight-bolder">
                    {{ item.uniqueSignalCount }} SIGNALS
                  </div>
                </q-badge>
              </q-item-label>
            </q-item-section>
            <q-item-section v-if="item && !item?.network">
              <q-item-label>
                <q-badge class="full-width text-center" style="min-height: 1.75em" color="green-9" text-color="white">
                  <div class="full-width
                  text-weight-bolder">
                    {{ item }}
                  </div>
                </q-badge>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-virtual-scroll>
      </div>

    </q-card-section>
    <q-card-section v-else-if="props.variant == 'pollution' && metadata?.max >= 0">
      <span>All Pollution data is per-second</span>
      <q-badge color="secondary" class="rounded-top q-pl-sm q-pr-sm full-width text-center text-caption">
        <div class="text-center full-width">Pollution Metadata</div>
        <q-tooltip class="bg-primary" anchor="top middle" self="bottom middle" :offset="[10, 10]">
          <q-badge>Pollution data is very simple, and has just a few values for metadata</q-badge>
        </q-tooltip>
      </q-badge>
      <q-btn-toggle
        class="shadow-0"
        square
        disable
        spread
        dense
        color="secondary"
        v-model="categoryOrDefault"
        toggle-color="primary"
        :options="modeOptions"
      />
      <div
        class="bg-blue-grey-2">
        <q-item v-if="!(metadata?.min >= 0)">
          <q-item-section>
            <q-item-label>
              <q-badge class="full-width text-center" style="min-height: 1.75em" text-color="white" color="red-10">
                <div class="full-width text-weight-bolder">
                  NO DATA
                </div>
              </q-badge>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-separator class="q-mb-sm q-mt-none"></q-separator>
        <q-item dense>
          <q-item-section>
            <q-item-label class="q-ml-lg q-mr-lg">
              <q-badge class="full-width text-center" style="min-height: 1.75em" text-color="white" color="green-10">
                <div class="full-width text-weight-bolder">
                  POLLUTION PER SECOND
                </div>
              </q-badge>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item dense>
          <!--q-item-section avatar side>
            <q-icon name="help"></q-icon>
          </q-item-section-->
          <q-item-section class="text-center">
            <q-badge style="min-height: 1.75em" text-color="white" color="green-9">
              <b class="text-weight-bolder numericValueClass">MIN</b>
              <q-space></q-space>
              {{ (metadata.min / (props.data.tickInterval / 60)).toFixed(2) }}
              <sub>/s</sub>
            </q-badge>
          </q-item-section>
          <q-item-section class="text-center">
            <q-badge style="min-height: 1.75em" text-color="white" color="green-9">
              <b class="text-weight-bolder numericValueClass">MAX</b>
              <q-space></q-space>
              {{ (metadata.max / (props.data.tickInterval / 60)).toFixed(2) }}
              <sub>/s</sub>
            </q-badge>
          </q-item-section>
          <q-item-section class="text-center">
            <q-badge style="min-height: 1.75em" text-color="white" color="green-8">
              <b class="text-weight-bolder numericValueClass">AVG</b>
              <q-space></q-space>
              {{ (metadata.avg / (props.data.tickInterval / 60)).toFixed(2) }}
              <sub>/s</sub>
            </q-badge>
          </q-item-section>
          <!--q-item-section class="col-3 text-center">
            <q-badge text-color="white" color="negative">
              <b class="full-width text-weight-bolder numericValueClass">{{item.value.cons.toFixed(1)}}</b>
              <sub>/s</sub>
            </q-badge>
          </q-item-section-->
        </q-item>
        <q-separator class="q-mt-sm q-mb-sm"/>
        <q-item dense>
          <q-item-section>
            <q-item-label class="q-ml-lg q-mr-lg">
              <q-badge class="full-width text-center" style="min-height: 1.75em" text-color="white" color="teal-10">
                <q-btn @click="addDatasetTemplate('pollution','pollution','count')" class="full-width text-weight-bolder">
                  ADD POLLUTION TO CHART
                </q-btn>
              </q-badge>
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </q-card-section>
    <q-card-section v-else-if="props.variant == 'system' && metadata?.length >= 0">
      <span>All System data is in milliseconds. System data cannot yet be charted because of this</span>
      <q-badge color="secondary" class="rounded-top q-pl-sm q-pr-sm full-width text-center text-caption">
        <div class="text-center full-width">System Metadata</div>
      </q-badge>
      <q-btn-toggle
        spread
        dense
        disable
        color="secondary"
        class="rounded-bottom"
        v-model="categoryOrDefault"
        toggle-color="primary"
        :options="modeOptions"
      />
      <div
        class="bg-blue-grey-2">
        <q-item dense v-if="metadata?.length > 0 || filterInput != ''">
          <q-item-section>
            <q-input debounce="500" color="white" label="Category" filled dense v-model="filterInput"></q-input>
          </q-item-section>
          <q-item-section class="col-2 text-center">
            <q-btn
              :icon-right="lastSort == 'avg:DESC' ? 'expand_more' : ( lastSort == 'avg:ASC' ? 'expand_less' : undefined)"
              @click="clickSortSys('avg')" size="sm" dense text-color="white" color="teal-7">
              <b class="text-weight-bolder text-body2">AVG</b>

            </q-btn>
          </q-item-section>
          <q-item-section class="col-2 text-center">
            <q-btn
              :icon-right="lastSort == 'min:DESC' ? 'expand_more' : ( lastSort == 'min:ASC' ? 'expand_less' : undefined)"
              @click="clickSortSys('min')" size="sm" dense text-color="white" color="positive">
              <b class="text-weight-bolder text-body2">MIN</b>

            </q-btn>
          </q-item-section>
          <q-item-section class="col-2 text-center">
            <q-btn
              :icon-right="lastSort == 'max:DESC' ? 'expand_more' : ( lastSort == 'max:ASC' ? 'expand_less' : undefined)"
              @click="clickSortSys('max')" size="sm" dense text-color="white" color="negative">
              <b class="text-weight-bolder text-body2">MAX</b>

            </q-btn>
          </q-item-section>
        </q-item>
        <q-item v-else>
          <q-item-section>
            <q-item-label>
              <q-badge class="full-width text-center" style="min-height: 1.75em" text-color="white" color="red-10">
                <div class="full-width text-weight-bolder">
                  NO DATA
                </div>
              </q-badge>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-separator class="q-mb-md q-mt-none"></q-separator>
        <q-virtual-scroll
          v-if="metadata?.length > 0 && metadata[0].min >= 0"
          style="max-height: 40em; min-height: 20em"
          :items="metadata"
          v-slot="{item, idx}"
        >
          <q-item :key="idx">
            <!--q-item-section avatar side>
              <q-icon name="help"></q-icon>
            </q-item-section-->
            <q-item-section>
              <q-item-label class="text-uppercase">
                {{ item.key }}
              </q-item-label>
            </q-item-section>
            <q-item-section class="col-2 text-center">
              <q-badge text-color="white" color="teal-7">
                <b class="full-width text-weight-bolder numericValueClass">{{ item.avg.toFixed(1) }}
                </b><sub>ms</sub>
              </q-badge>
            </q-item-section>
            <q-item-section class="col-2 text-center">
              <q-badge text-color="white" color="positive">
                <b class="full-width text-weight-bolder numericValueClass">{{ item.min.toFixed(1) }}
                </b> <sub>ms</sub>
              </q-badge>
            </q-item-section>
            <q-item-section class="col-2 text-center">
              <q-badge text-color="white" color="negative">
                <b class="full-width text-weight-bolder numericValueClass">{{ item.max.toFixed(1) }}</b>
                <sub>ms</sub>
              </q-badge>
            </q-item-section>
          </q-item>
        </q-virtual-scroll>
      </div>
    </q-card-section>
  </div>
  <!--q-card v-if="props.variant != 'blueprint'" style="min-height: 50em">

  </q-card-->
</template>

<style scoped>

.rounded-bottom {
  border-radius: 0 0 0.5em 0.5em;
}

.rounded-top {
  border-radius: 0.5em 0.5em 0 0;
}

</style>
