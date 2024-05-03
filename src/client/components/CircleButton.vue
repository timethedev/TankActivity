<script setup lang="ts">   
    import { defineProps, ref } from 'vue'

    const props = defineProps({
        icon: String
    })

    const icon = ref(props.icon)
</script>

<template>
  <div class="iconButton">
    <img :src="icon"/>
  </div>
</template>

<style scoped>
    .iconButton {
        background:white;
        border:.21vw solid black;
        border-radius:100vw;
        height:min-content;

        height:3.75vw;
        width:3.75vw;

        display:flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;

        padding:.9vw;
        transition: .1s ease;
    }

    .iconButton:hover {
        cursor: pointer;
        transform: scale(1.1);
    }

    .iconButton img {
        width:100%;
    }
</style>

