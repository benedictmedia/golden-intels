const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')

let io

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        'https://golden-intels.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Authentication error'))
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.user = decoded
      next()
    } catch {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    const user = socket.user
    console.log(`Socket connected: ${user.name} (${user.role})`)

    // Every user joins their own personal room
    socket.join(`user_${user.id}`)

    // Admins also join the shared admin room so all admins receive parent messages
    if (user.role === 'admin') {
      socket.join('admin_room')
      console.log(`Admin ${user.name} joined admin_room`)
    }

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${user.name}`)
    })
  })

  return io
}

const getIO = () => io

module.exports = { initSocket, getIO }