<script setup lang="ts">   
    import { ref, watch, onMounted } from 'vue'
    import { Sound } from "../assets/SoundManager"

    const one = new Sound("/voiceover/1.ogg");
    const two = new Sound("/voiceover/2.ogg");
    const three = new Sound("/voiceover/3.ogg");

    const sfx = [one, two]

    const props = defineProps({
        hidden: Boolean
    })

    const number = ref(3)
    const nElement = ref()
    const hidden = ref(false)

    onMounted(() => {
        three.localPlay(.15, false)

        const x = setInterval(() => {
            if (number.value > 0) {
                number.value -= 1
                nElement.value?.classList.add("animation")
                sfx[number.value-1].localPlay(.15, false)
                setTimeout(() => {
                    nElement.value?.classList.remove("animation")
                }, 800)
            } else {
                clearInterval(x)
            }
        }, 1000)
    })

    watch(() => props.hidden, (h) => {
        hidden.value = h
    })
</script>

<template>
  <div :class="`countdownScreen ${hidden && 'hidden'}`">
    <span ref="nElement" class="number">{{ number }}</span>
  </div>
</template>

<style scoped>
    .countdownScreen {
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

        animation-name: maskOut;
        animation-duration: 3s;
        animation-fill-mode: forwards;
    }

    
    .countdownScreen .number {
        font-family: "Montserrat Variable", sans-serif;
        font-size:15vw;
        font-weight:900;
        color:white;
    }

    .number.animation {
        animation-name: scale;
        animation-duration: .75s;
        animation-fill-mode: forwards;
    }

    @keyframes scale {
        0% {transform: scale(1.15);}
        50% {transform: scale(.95);}
        100% {transform: scale(1);}
    }

    @keyframes maskOut {
      70% {
          clip-path: circle(100vw at center); /* Initial clip-path */
      }
      100% {
          clip-path: circle(0% at center); /* Final clip-path */
      }
    }
</style>

