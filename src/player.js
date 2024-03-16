import { settings } from "./game.js";
import { clamp } from "./utils.js";

export default class Player {
  constructor(player = "left", y = 0) {
    this.x =
      player === "left"
        ? settings.paddleWidth * 3
        : settings.width - settings.paddleWidth * 3
    this.y = settings.height / 2;
    this.position = player;

    this.speed = 0;
    this.score = 0;
  }

  update() {
    this.y += this.speed;
    this.y = clamp(this.y, settings.paddleHeight / 2 + 2, settings.height - settings.paddleHeight / 2 - 2);
    this.speed *= 0.95;
  }

  move(x, y) {
    this.x = x;
    this.y = y;
  }

  setScore(score) {
    this.score = score;
  }

  increaseScore() {
    this.score++;
  }
}
