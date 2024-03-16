import { settings } from "./game.js";
import { clamp, circleRectIntersection } from "./utils.js";
import { emitScore } from './index.js'

export default class Ball {
  constructor() {
    this.radius = settings.ballRadius;
    this.x = settings.width / 2;
    this.y = settings.height / 2;
    this.speed = { x: 10, y: 0 };
    this.angle = 0;
    this.reset();
  }

  intersects(player) {
    const { paddleWidth, paddleHeight } = settings;

    const intersects = circleRectIntersection(
      { x: this.x, y: this.y, radius: this.radius },
      {
        x: player.x,
        y: player.y,
        width: paddleWidth,
        height: paddleHeight,
      }
    );

    if (intersects) {
      const collisionPoint = Math.abs(this.x - player.x) / (paddleWidth / 2);

      if (collisionPoint > 1) {
        this.x = player.x + (paddleWidth / 2 + this.radius) * Math.sign(this.x - player.x);
        this.speed.x *= -1;
      } else {
        this.y = player.y + (paddleHeight / 2 + this.radius) * Math.sign(this.y - player.y);
        this.speed.y *= -1;
      }
    }
  }

  intersectBounds() {
    if (this.x + this.radius >= settings.width) {
      // right loses
      emitScore("left")
      this.reset();
      // this.speed.x *= -1;
      return;
    }
    if (this.x <= this.radius) {
      // left loses
      emitScore("right")
      this.reset();
      // this.speed.x *= -1;
      return;
    }

    // top and bottom
    if (this.y + this.radius >= settings.height) {
      this.y = settings.height - this.radius;
      this.speed.y *= -1;
    } else if (this.y <= this.radius) {
      this.y = this.radius;
      this.speed.y *= -1;
    }
  }

  reset() {
    this.x = settings.width / 2;
    this.y = settings.height / 2;

    let randomAngle = Math.PI / 4 - Math.random() * Math.PI / 2
    if (Math.random() > 0.5) randomAngle += Math.PI;

    this.speed.x = 10 * Math.cos(randomAngle);
    this.speed.y = 10 * Math.sin(randomAngle)

    this.speed.x = clamp(this.speed.x, -10, 10);
    this.speed.y = clamp(this.speed.y, -10, 10);
  }

  update() {
    this.x += this.speed.x;
    this.y += this.speed.y;

    this.intersectBounds();
  }
}
