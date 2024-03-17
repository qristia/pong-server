import { settings } from "./game.js";
import { clamp, circleRectIntersection } from "./utils.js";
import { emitCollision, emitScore } from './index.js'

export default class Ball {
  constructor() {
    this.radius = settings.ballRadius;
    this.x = settings.width / 2;
    this.y = settings.height / 2;
    this.speed = { x: 5, y: 0 };
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
      const x = this.x - player.x;
      const y = this.y - player.y;
      const collisionPoint = Math.abs(x) / paddleWidth * 2
      const force = y / paddleHeight * 20

      if (collisionPoint > 1) {
        this.x = player.x + (paddleWidth / 2 + this.radius) * Math.sign(x);
        this.speed.x *= -1;
      } else {
        this.y = player.y + (paddleHeight / 2 + this.radius) * Math.sign(y);
        this.speed.y *= -1;
      }

      this.speed.y += force;
      emitCollision()
    }
  }

  intersectBounds() {
    if (this.x + this.radius >= settings.width) {
      // right loses
      this.reset();
      emitScore("left")
      return;
    }
    if (this.x <= this.radius) {
      // left loses
      this.reset();
      emitScore("right")
      return;
    }

    // top and bottom
    if (this.y + this.radius >= settings.height) {
      this.y = settings.height - this.radius;
      this.speed.y *= -1;
      emitCollision()
    } else if (this.y <= this.radius) {
      this.y = this.radius;
      this.speed.y *= -1;
      emitCollision()
    }
  }

  reset() {
    this.x = settings.width / 2;
    this.y = settings.height / 2;

    let randomAngle = Math.PI / 4 - Math.random() * Math.PI / 2
    if (Math.random() > 0.5) randomAngle += Math.PI;

    this.speed.x = settings.ballSpeed * Math.cos(randomAngle);
    this.speed.y = settings.ballSpeed * Math.sin(randomAngle);

    // this.speed.x = clamp(this.speed.x, -settings.ballSpeed, settings.ballSpeed);
    // this.speed.y = clamp(this.speed.y, -settings.ballSpeed, settings.ballSpeed);
  }

  update(deltaTime) {
    const t = deltaTime / 1000;
    this.x += this.speed.x * t;
    this.y += this.speed.y * t;
    // this.x += this.speed.x;
    // this.y += this.speed.y;

    this.intersectBounds();
  }

  get() {
    return {
      x: this.x,
      y: this.y,
      speed: this.speed,
      time: Date.now()
    }
  }
}
