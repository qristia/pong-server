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
    if (player == null) return;
    players[player.position].move(player.x, player.y)
    io.emit("player moved", player) 
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
  io.emit("game start", {})
  intervalId = setInterval(loop, 1000 / tick)
}

function stopGame() {
  GAME_STATE.running = false;
  GAME_STATE.ball = new Ball();
  clearInterval(intervalId)
  io.emit('game over', true)
}

export function emitScore(position) {
  const player = players[position];
  player.increaseScore();
  io.emit('player score', {position, totalScore: player.score })
}

let intervalId = -1;
let tick = 128;
function loop() {
  const { ball } = GAME_STATE;

  for (const player in players) {
    ball.intersects(players[player])
  }

  ball.update();

  io.emit("ball movement", { x: ball.x, y: ball.y })
}

server.listen(3000, () => {
  console.log("listening on port 3000");
});
