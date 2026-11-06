import 'dotenv/config'
import app from './App.js'
import './config/database.js';

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`API rodando na porta ${port}`)
})