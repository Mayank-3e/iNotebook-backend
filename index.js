require('dotenv').config();
const connectToMongo=require("./db")
const express = require('express')
const cors = require('cors')

let mongoerror=null
try {connectToMongo()}
catch (error) {mongoerror=error}

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors())

// Available Routes
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))

app.listen(port, () => {
console.log(`iNotebook webapp listening on port ${port}`)
})
