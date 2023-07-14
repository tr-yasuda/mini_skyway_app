const express = require('express')
const app = express()

const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000']
  }
})

const PORT = 5500

// communication with client
io.on('connection', (socket) => {
  let room = ''
  console.log(socket.id)

  // ルームに参加
  socket.on('join', (roomName) => {
    room = roomName
    socket.join(room)
  })

  // 切断
  socket.on('disconnect', () => {
    socket.leave(room)
    console.log(`disconnected ${socket.id}`)
  })

  // ルームにいるユーザーに電話をかける
  socket.on('callUser', (data) => {
    console.log(`received call user from ${data.from}`)
    socket.broadcast
      .to(room)
      .emit('callUser', { signal: data.signal, from: data.from })
  })

  socket.on('answerCall', (data) => {
    console.log(`received answer call from ${data.from}`)
    socket.broadcast
      .to(room)
      .emit('callAccepted', { signal: data.signal, from: data.from })
  })
})

server.listen(PORT, () => console.log(`listening on port on ${PORT}`))
