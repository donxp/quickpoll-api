const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const server = require('http').Server(app)
const io = require('socket.io')(server)

const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors())

const pollRoute = require('./routes/api/poll')
app.use('/api/poll', pollRoute)

server.listen(port, () => {
    console.log(`Poll API server started on port ${port}`)
})

io.on('connection', socket => {
    console.log('new socket connection')
})

global.io = io