const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const pollRoute = require('./routes/api/poll')
app.use('/api/poll', pollRoute)

app.listen(port, () => {
    console.log(`Poll API server started on port ${port}`)
})