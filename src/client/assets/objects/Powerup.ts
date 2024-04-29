import Powerups from "../../../data-structures/Powerups"

//Class for object version of powerup
export class Powerup {
  name: string;
  id: number;

  constructor(name: string, id: number) {
    let powerup = Powerups.find((Powerup) => Powerup.name == name)

    if (powerup) {
      this.name = name
      this.id = id
    }

    add([
      "Powerup", 
      `${this.name}_${this.id}`, //BANANA_12345
      anchor("center"),
      rect(25, 25),
      area(),
      pos(Math.random()*(width()/2), Math.random()*(height()/2)),
      color(YELLOW),
      {
        data: this
      }
    ])
  }
}
