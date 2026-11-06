import express from 'express'
import cors from 'cors'
import routes from './Routes/Index.js'
import errorHandler from './Middlewares/errorHandler.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
    res.json({status: 'ok'})
})

app.use(routes)
app.use(errorHandler)

export default app