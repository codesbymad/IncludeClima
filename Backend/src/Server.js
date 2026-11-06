import 'dotenv/config';
import app from './App.js';
import './Config/Database.js';

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`API rodando na porta ${port}`);
});