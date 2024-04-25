import { GameObj } from "kaboom";
import "kaboom/global";

class Turret {
    constructor (tank: GameObj, userTag: string) {
        this.tank = tank;
        this.turret = add([
            rect(30, 10),
            anchor("left"),
            pos(center()),
            z(1),
            "Turret",
            userTag,
            {
                data: this,
            },
        ]);
    }
    tank: GameObj;
    speed: number = 0;
    angle: number = 0;
    turret: GameObj;
}

export { Turret };