import Powerups from "../../../data-structures/Powerups"

class Vec2 {
  x: number; y: number;
}

//Class for object version of powerup
export class Powerup {
  name: string;
  pos: Vec2;
  id: number;

  constructor(name: string, position: Vec2, id: number) {
    let powerup = Powerups.find((Powerup) => Powerup.name == name)

    if (powerup) {
      this.name = name
      this.pos = position
      this.id = id
    }

    add([
      "Powerup",
      `${this.name}_${this.id}`, //BANANA_12345
      anchor("center"),
      area(),
      pos(vec2(this.pos.x, this.pos.y)),
      sprite("PowerupOrb"),
      {
        data: this
      }
    ])
  }
}
