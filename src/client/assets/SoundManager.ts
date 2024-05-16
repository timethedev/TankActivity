import { Socket } from "socket.io-client";


export interface GlobalSoundData {
    UserId: number | string | undefined,
    id: string,
    volume: number
}

function playAudio(audioUrl: string, volume: number, loop: boolean) {
    var audio = new Audio(audioUrl);
    audio.volume = volume;
    if (loop) audio.loop = true

    audio.play();

    return audio
}

export class Sound {
    constructor (id: string) {
        this.id = id;
    }

    id: string;
    audio: any;
    originalVolume: number = 0;

    localPlay(volume: number, loop:boolean) {
        this.originalVolume = volume;
        this.audio = playAudio(this.id, volume, loop); 
    }

    mute(mute: boolean) {
        this.audio.volume = mute ? 0 : this.originalVolume
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