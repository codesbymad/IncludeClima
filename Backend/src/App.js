import express from 'express'
import cors from 'cors'
import routes from './Routes/Index.js'
import errorHandler from './Middlewares/errorHandler.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './Config/Swagger.js'

const app = express()

app.use(cors())
app.use(express.json())

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Verifica se a API está no ar
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: API funcionando
 */

app.get('/health', (req, res) => {
    res.json({status: 'ok'})
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/docs.json', (req, res) => res.json(swaggerSpec))
app.use(routes)
app.use(errorHandler)

export default app