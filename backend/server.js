require('dotenv').config();

const express = require('express');
const cors = require('cors')

const commentsRoute = require('./routes/comment')


//express app
const app = express();

//middleware

app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next()
})

//routes
app.use(commentsRoute)


app.listen(process.env.PORT, () => {
    console.log('listening on port 4000')
})
