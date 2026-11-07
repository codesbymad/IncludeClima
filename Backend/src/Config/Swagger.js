import swaggerJsdoc from 'swagger-jsdoc'

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'IncludeClima API', 
            version: '1.0.0',
            description: 'API de pesquisa de clima organizacional da Include Jr.'
        },
        servers: [
            { url: process.env.API_URL || 'http://localhost:3000' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/Routes/*.js', './src/App.js']
}

export default swaggerJsdoc(options)