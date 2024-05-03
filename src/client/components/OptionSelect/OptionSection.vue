<script setup lang="ts">   
    import OptionCircle from "./OptionCircle.vue"
    import { defineProps, ref } from 'vue'

    const props = defineProps({
        options: Array as PropType<{ name: string, members: number[] }[]>,
    })

    const options = ref(props.options)
</script>

<template>
  <div class="container">
    <div class="optionSection">
        <OptionCircle v-for="option in options" :key="option" :option="option" :scaled="option == options[Math.floor(options.length/2)]"></OptionCircle>
    </div>
  </div>
</template>

<style scoped>
    .container {
        width:100vw;
        height:100vh;
        margin-top:1vw;

        display:flex;
        justify-content:center;
        align-items:center;
    }

    .optionSection {
        display:flex;
        gap:2vw;
        width:min-content;
    }
</style>

