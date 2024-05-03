import kaboom from "kaboom";
import "kaboom/global";

import game from "./game";
import wait from "./wait"

const canvas: any = document.querySelector("#kaboomCanvas")

function setup(socket) {
    canvas.classList.add("hidden")

    // start the game
    kaboom({
        width: 1920,
        height: 1080,
        letterbox: true,
        background: [20, 20, 40],
        logTime: 3,
        logMax: 3,
        focus: true,
        canvas: canvas,
    })

    scene("game", (() => game(socket)))
    scene("wait", (() => wait()))
}

function showGame() {
    canvas.classList.remove("hidden")
    go("game")

    setInterval(() => canvas.focus(), 100)
}

function hideGame() {
    canvas.classList.add("hidden")
    go("wait")
}

export default setup;
export {
    showGame,
    hideGame
}
