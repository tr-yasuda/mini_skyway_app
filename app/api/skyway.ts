import { io } from 'socket.io-client'

const socket = io('http://localhost:5500')

// connect to signaling server
socket.on('on_message', (event) => {
  console.log(event.data)
  const message = JSON.parse(event)
  if (message.type === 'offer') {
    console.log(message, 'offer')
  } else if (message.type === 'answer') {
    console.log(message, 'answer')
  }
})
