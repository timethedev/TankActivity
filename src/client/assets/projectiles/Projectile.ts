import { GameObj, Vec2, Color } from "kaboom";
import "kaboom/global";

import { Tank } from "../objects/Tank";

// MATHEMATICAL FUNCTIONS
const RAD_TO_DEG: number = 180 / Math.PI;
const DEG_TO_RAD: number = Math.PI / 180;

function vectorToAngle(vector: Vec2): number {
    return Math.atan2(vector.y, vector.x) * RAD_TO_DEG; // Assuming conversion to degrees
}

function angleToVector(angleInDegrees: number): Vec2 {
    const angleInRadians: number = angleInDegrees * DEG_TO_RAD; // Assuming conversion to radians
    const x: number = Math.cos(angleInRadians);
    const y: number = Math.sin(angleInRadians);
    return vec2(x, y);
}


class Projectile {
    constructor (tank: Tank, originPosition: Vec2, angle: number, colour: Color) {
        this.tank = tank;
        this.angle = angle;
        this.speed = 15;
        this.controller = add([
            rect(20, 20),
            color(colour),
            anchor("center"),
            area(),
            rotate(angle),
            pos(originPosition),
            offscreen({ destroy: true }),
            z(0),
            "Projectile",
            {
                data: this,
            },
        ])
    }

    tank: Tank;
    controller: GameObj;
    speed: number = 0;
    angle: number = 0;

    updateController () {
        const projectileData: Projectile = this;
        const projectileController: GameObj = projectileData.controller;
        const directionVector: Vec2 = angleToVector(projectileData.angle);

        projectileController.pos = projectileController.pos.add(directionVector.scale(projectileData.speed));
        projectileController.angle = projectileData.angle;
    }
}

export { Projectile };