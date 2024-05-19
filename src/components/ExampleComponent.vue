<template>
  <div>
    <p>{{ title }}</p>
    <ul>
      <li v-for="todo in todos" :key="todo.id" @click="increment">
        {{ todo.id }} - {{ todo.content }}
      </li>
    </ul>
    <p>Count: {{ todoCount }} / {{ meta.totalCount }}</p>
    <p>Active: {{ active ? 'yes' : 'no' }}</p>
    <p>Clicks on todos: {{ clickCount }}</p>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {Todo, Meta} from './models';
import {usePublicApi} from "stores/public-api";

interface Props {
  title: string;
  todos?: Todo[];
  meta: Meta;
  active: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  todos: () => [],
});

const clickCount = ref(0);

function increment() {
  clickCount.value += 1;
  return clickCount.value;
}

const todoCount = computed(() => props.todos.length);

const api = usePublicApi();

onMounted(() => {

  api.querySource('e6842e9604152814817e2967e702aaf18b82b9daddcead29b05584fcc285f8e6').then((data) => {
    console.log(data);
  });

  console.log('Component mounted');
  // run a test query to the path below
  // https://api.factorioanalytics.com/query/9b5eae6f-ab01-4dbc-a260-a742cce807d0/data_item
  fetch('/api/query/9b5eae6f-ab01-4dbc-a260-a742cce807d0/data_item')
    .then(response => response.json())
    .then(data => console.log(data));
})

</script>
