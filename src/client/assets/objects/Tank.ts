import { Color, GameObj } from "kaboom";
import "kaboom/global";

import { Turret } from "./Turret";

class Tank {
    constructor (colour: Color, userTag: string, userId: number | undefined) {
        this.tankModel = add([
            rect(60, 50),
            color(colour),
            anchor("center"),
            pos(width()/2, height()/2),
            z(0),
            "Tank",
            userTag,
            {
                data: this,
            },
        ])
        this.turret = new Turret(this.tankModel, userTag).turret;
        this.userId = userId;
    }
    tankModel: GameObj;
    turret: GameObj;
    userId: number | undefined;
    speed: number = 0;
    angle: number = 0;

    exportData (tankData: Tank = this) {
        const tank: GameObj = tankData.tankModel;
        return {
            position: tank.pos,
            angle: tankData.angle,
            userId: tankData.userId,
        }
    }
}

export { Tank };