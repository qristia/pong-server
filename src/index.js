import express from "express";
import http from "http";
import { Server } from 'socket.io'

import Ball from './ball.js'
import Player from './player.js'

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const users = [];
const players = {};

const GAME_STATE = {
  running: false,
  ball: new Ball()
}

app.get("/", (req, res) => {
  res.send("hello world")
})

io.on('connection', (socket) => {
  const id = socket.id
  console.log(`${id} connected`)

  if (users.length > 2) {
    console.log('only 2 users supported')
    return;
  }

  let position = "left"
  for (const player in players) {
    if (players[player].position === "left") position = "right";
  }

  users.push({ id, position })
  players[position] = new Player(position)

  io.emit("user connected", {
    users,
  })

  if (users.length === 2) {
    startGame();
  }

  socket.on('player status', (player) => {
    if (player == null || !players[player.position]) return;
    players[player.position].move(player.x, player.y)
    io.emit("player moved", player)
  })

  socket.on("ping", () => {
    socket.emit("pong", Date.now())
  })

  socket.on('disconnect', () => {
    console.log(`${id} disconnected`)

    const index = users.findIndex((v) => v.id === id)
    if (index >= 0) {
      users.splice(index, 1);
      delete players[position]
      stopGame();
    }

    io.emit('user disconnected', {
      position
    })
  })
})

function startGame() {
  if (GAME_STATE.running) return;
  GAME_STATE.running = true;

  const { ball } = GAME_STATE;
  io.emit("game start", { ball: { x: ball.x, y: ball.y, speed: ball.speed, time: Date.now() } })
  intervalId = setInterval(loop, 1000 / tick)
}

function stopGame() {
  GAME_STATE.running = false;
  GAME_STATE.ball = new Ball();
  clearInterval(intervalId)
  io.emit('game over', true)
}

export function emitScore(position) {
  const { ball } = GAME_STATE;
  const player = players[position];
  player.increaseScore();
  io.emit('player score', {
    player: {
      position, totalScore: player.score,
    },
    ball: ball.get()
  })
}

export function emitCollision() {
  const { ball } = GAME_STATE;
  io.emit('ball collision', ball.get())
}

let intervalId = -1;
let tick = 128;

let lastTime = 0;
let deltaTime = 0;
function loop() {
  const now = performance.now();
  deltaTime = now - lastTime;
  lastTime = now;
  const { ball } = GAME_STATE;

  for (const player in players) {
    ball.intersects(players[player])
  }

  ball.update(deltaTime);

  io.emit("ball movement", ball.get())
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`listening on port ${port}`);
});
