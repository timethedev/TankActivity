import Powerups from "../../../data-structures/Powerups"

class Vec2 {
  x: number; y: number;
}

//Class for object version of powerup
export class Powerup {
  name: string;
  pos: Vec2;
  id: number;
  img: string;
  powerupData: Powerup;

  constructor(powerupData: Powerup) {
    let powerup = Powerups.find((Powerup) => Powerup.name == powerupData.name)
 
    if (powerup) {
      this.name = powerupData.name
      this.pos = powerupData.position
      this.id = powerupData.id
      this.img = powerupData.img
      this.powerupData = powerupData
    }

    add([
      "Powerup",
      `${powerupData.name}_${powerupData.id}`, //BANANA_12345
      anchor("center"),
      area(),
      pos(vec2(powerupData.pos.x, powerupData.pos.y)),
      sprite("PowerupOrb"),
      {
        data: this
      }
    ])
  }
}
