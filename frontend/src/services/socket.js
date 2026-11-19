import { io } from 'socket.io-client'

let socket = null

export function connectSocket(token) {
    if (socket) return socket

    socket = io('http://localhost:3000', {
        auth: (cb) => cb({ token: localStorage.getItem('token') }),
        transports: ['polling', 'websocket'],
    })

    return socket
}

export function getSocket() {
    return socket
}

export function disconnectSocket() {
    socket?.disconnect()
    socket = null
}