import express from 'express'
import http from 'http'
import { matchRouter } from './routes/matches.js';
import { commentaryRouter } from './routes/commentary.js';
import { attachWebSocketServer } from '../src/ws/server.js'
import { securityMiddleware } from './arcjet.js';


const PORT = Number(process.env.PORT || 8000)
const HOST = process.env.HOST  || '0.0.0.0'



const app = express();
const server = http.createServer(app)

app.use(express.json())
app.use(securityMiddleware())


app.use('/matches', matchRouter)
app.use('/matches/:id/commentary', commentaryRouter)


const { broadcastMatchCreated } = attachWebSocketServer(server)

app.locals.broadcastMatchCreated = broadcastMatchCreated

server.listen(PORT, () => {
    const baseUrl = `http://localhost:${PORT}`
    console.log(`the server is running ${baseUrl}`);
    console.log(`web socket server is running on ${baseUrl.replace('http', 'ws')}/ws`);
})