import { GameObj, Vec2, Color } from "kaboom";
import "kaboom/global";
import { Projectile } from "../projectiles/Projectile";

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

class Fire {
    constructor (origin: Projectile, position: Vec2) {
        this.origin = origin;
        this.controller = add([
            sprite("Fire"),
            anchor("center"),
            area(),
            scale(.3),
            timer(),
            pos(position),
            offscreen({ destroy: true }),
            z(0),
            "Fire",
            {
                data: this,
            },
        ])

        this.controller.wait(5, () =>{
            destroy(this.controller);
        })
    }

    origin: Projectile;
    controller: GameObj;
}

export { Fire };