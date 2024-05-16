<script setup lang="ts">   
    import { defineProps, ref, watch } from 'vue'

    const props = defineProps({
        loaded: Boolean
    })

    const loaded = ref(props.loaded)
    const firstLoad = ref(false)

    watch(() => props.loaded, (l) => {
        loaded.value = l

        if (loaded.value == true) {
            firstLoad.value = true
        }
    })
</script>

<template>
  <div :class="`loadingScreen ${loaded == true && 'hidden'} ${firstLoad && 'loading'}`">
    <img class="logo" :src="'/assets/logo.png'"></img>
    <span class="loader"></span>
    <img class="controls" :src="'/assets/controls.svg'"></img>
  </div>
</template>

<style scoped>
    .loadingScreen {
        position:absolute;
        background:black;
        width:100vw;
        height:100vh;
        z-index:10;

        top:0;
        left:0;
        box-sizing: border-box;

        display:flex;
        justify-content:center;
        align-items:center;

        transition:.25s ease;
    }

    .loadingScreen.loading .logo {
        display:none;
    }

    .loadingScreen.loading .controls {
        display:none;
    }

    .loadingScreen.hidden {
        opacity:0;
        pointer-events:none;
    }

    .loadingScreen .logo {
        top:5vw;
        left:50%;
        transform: translateX(-50%);
        width:22vw;
    }

    .loadingScreen .controls {
        position:absolute;
        bottom:5vw;
        left:50%;
        transform: translateX(-50%);
        width:35vw;
    }

    .loader {
        width: 3.5vw;
        height: 3.5vw;
        border: .5vw solid #FFF;
        border-bottom-color: transparent;
        border-radius: 50%;
        display: inline-block;
        box-sizing: border-box;
        animation: rotation 1s linear infinite;
    }

    @keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
    } 
</style>

