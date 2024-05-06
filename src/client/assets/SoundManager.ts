import { Socket } from "socket.io-client";


export interface GlobalSoundData {
    UserId: number | string | undefined,
    id: string,
    volume: number
}

function playAudio(audioUrl: string, volume: number) {
    var audio = new Audio(audioUrl);
    console.log(audio, audioUrl)
    audio.volume = volume;
    audio.play();
}
  

export class Sound {
    constructor (id: string) {
        this.id = id;
    }

    id: string;

    localPlay(volume: number) {
        playAudio(this.id, volume);
    }

    globalPlay(userId: number | string | undefined, socket: Socket, volume: number, globalOffset: number) {
        playAudio(this.id, volume);
        socket.emit("play-sound", {
            UserId: userId,
            id: this.id,
            volume: volume - globalOffset
        })
    }
}