import "./style.css";
import { createApp } from "vue";
import App from "./App.vue";// Supports weights 100-900 in a single small file.
import "@fontsource-variable/fredoka";
import '@fontsource-variable/montserrat';

import { Sound } from "./assets/SoundManager"

let app = createApp(App)
app.mount("#app");

let hoverSound = new Sound("/sounds/select.ogg")

app.directive('hover-sound', (el: any) => {
    el.addEventListener('mouseenter', () => {
        hoverSound.localPlay(.2, false);
    });
})