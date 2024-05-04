<script setup lang="ts">
  import { defineProps, ref, watch } from 'vue'
  import PlayerIcon from './PlayerIcon.vue'
  import { socket } from "../../socket"

  const props = defineProps({
    scaled: Boolean,
    option: String
  })

  const option = ref(props.option)
  const scaledClass = ref(props.scaled ? 'scaled' : '')

  watch(() => props.option, (o) => {
    option.value = o
  })

  const handleClick = () => {
    socket.emit("select-option", {
      selectedOption: option.value.name
    })
  }
</script>

<template>
  <div :class="`optionCircleCont ${scaledClass}`">
    <div class="optionCircle" @click="handleClick">
      <div class="playerList">
        <PlayerIcon v-for="member in option.members" :key="member" :member="member"/>
      </div>
    </div>
    <h1>{{ option.name }}</h1>
  </div>
</template>

<style scoped>
.optionCircleCont {
  display:flex;
  flex-direction: column;
  gap:.4vw;
  color:white;
  font-weight:900;
  align-items:center;
}

.playerList {
  position:absolute;
  width:100%;
  height:100%;
  padding:2.5vw;
  box-sizing: border-box;
  border-radius:100vw;
  z-index:3;

  display:flex;
  flex-flow: row wrap;
  justify-content:center;
  align-content:center;
  align-items:center;
  gap:.3vw;
}

.optionCircle {
  width:6vw;
  height:6vw;

  display:flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle, #1D41FF 0%, #1C31F5 100%);
  padding:4vw;

  border: .4vw solid #000A65;
  outline: .3vw solid white;
  border-radius: 500px;
  transform: scale(0.99);

  transition: .1s ease;
}

.optionCircle:hover {
  cursor: pointer;
  transform: scale(1.1);
}

.optionCircleCont.scaled .optionCircle {
  transform: scale(1.1);
  margin:0 2vw;
}

.optionCircleCont.scaled .optionCircle:hover {
  transform: scale(1.2);
}

.optionCircleCont.scaled h1 {
  margin-top:2.5vw;
}

h1 {
  font-family: "Fredoka", sans-serif;
  -webkit-text-stroke-width: .5vw;
  -webkit-text-stroke-color: black;
  paint-order: stroke fill;
  text-shadow: black 0 .4vw;
  font-size:2.2vw;
}
</style>

