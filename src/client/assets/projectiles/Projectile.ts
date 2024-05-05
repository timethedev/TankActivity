import { GameObj, Vec2 } from "kaboom";
import "kaboom/global";

import { Tank } from "../objects/Tank";
import { Fire } from "../objects/Obstacles";

// MATHEMATICAL FUNCTIONS
const DEG_TO_RAD: number = Math.PI / 180;

function angleToVector(angleInDegrees: number): Vec2 {
    const angleInRadians: number = angleInDegrees * DEG_TO_RAD; // Assuming conversion to radians
    const x: number = Math.cos(angleInRadians);
    const y: number = Math.sin(angleInRadians);
    return vec2(x, y);
}


class Projectile {
    constructor (tank: Tank, originPosition: Vec2, angle: number) {
        this.tank = tank;
        this.angle = angle;
        this.speed = 15;
        this.controller = add([
            sprite("Bullet"),
            anchor("center"),
            area(),
            timer(),
            scale(0.8),
            rotate(angle),
            pos(originPosition),
            offscreen({ destroy: true }),
            z(0),
            "Projectile",
            {
                data: this,
            },
        ])

        wait(5, () => destroy(this.controller))
    }

    tank: Tank;
    controller: GameObj;
    speed: number = 0;
    angle: number = 0;

    updateController () {
        const projectileData: Projectile = this;
        const projectileController: GameObj = projectileData.controller;
        const directionVector: Vec2 = angleToVector(projectileData.angle);

        projectileController.pos = projectileController.pos.add(directionVector.scale(projectileData.speed * dt() * 50));
        projectileController.angle = projectileData.angle;
    }
}

class IceProjectile extends Projectile {
    updateController () {
        const projectileData: Projectile = this;
        const projectileController: GameObj = projectileData.controller;
        const directionVector: Vec2 = angleToVector(projectileData.angle);

        projectileController.pos = projectileController.pos.add(directionVector.scale(projectileData.speed * dt() * 50));
        projectileController.angle = projectileData.angle;

        
    }
}

class FireProjectile extends Projectile {
    constructor (tank: Tank, originPosition: Vec2, angle: number) {
        super(tank, originPosition, angle)
        this.controller.wait(0.25, () =>{
            let l = loop(0.25, () =>{
                if (this.controller) new Fire (this, this.controller.pos);
            })

            this.controller.onDestroy(() => l.cancel())
        })
    }
}

export { Projectile, IceProjectile, FireProjectile };