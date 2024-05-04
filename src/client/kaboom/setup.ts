import kaboom from "kaboom";
import "kaboom/global";

import { getAuth } from "../discord/discordSdk";

import game from "./game";
import wait from "./wait"

const canvas: any = document.querySelector("#kaboomCanvas")

let current = "wait"
let mapId: number;

function setup(socket: any) {
    canvas.classList.add("hidden")

    // start the game
    kaboom({
        width: 1920,
        height: 1080,
        background: [20, 20, 40],
        letterbox: true,
        focus: true,
        canvas: canvas,
    })

    scene("game", (() => game(socket, mapId, getAuth())))
    scene("wait", (() => wait()))
}

function showGame(mId: number) {
    mapId = mId;
    
    canvas.classList.remove("hidden")
    go("game")
    current = "game"

    let i = setInterval(() => {
        canvas.focus()
        if (current != "game") clearInterval(i)
    }, 1000)
}

function hideGame() {
    canvas.classList.add("hidden")
    current = "wait"
    go("wait")
}

export default setup;
export {
    showGame,
    hideGame
}
