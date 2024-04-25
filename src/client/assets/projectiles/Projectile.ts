import { GameObj, Vec2, Color } from "kaboom";
import "kaboom/global";

import { Tank } from "../objects/Tank";

class Projectile {
    constructor (tank: Tank, originPosition: Vec2, angle: number, colour: Color) {
        this.tank = tank;
        this.angle = angle;
        this.speed = 15;
        this.projectile = add([
            rect(20, 20),
            color(colour),
            anchor("center"),
            rotate(angle),
            pos(originPosition),
            offscreen({ destroy: true }),
            z(0),
            "projectile",
            {
                data: this,
            },
        ])
    }

    tank: Tank;
    projectile: GameObj;
    speed: number = 0;
    angle: number = 0;
}

export { Projectile };