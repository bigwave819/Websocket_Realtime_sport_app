import express from 'express'
import { matchRouter } from './routes/matches';

const app = express();
const port = 8000;


app.use(express.json())
app.use('/matches', matchRouter)


app.get('/', (req, res) => {
    console.log(`the server is running at http://localhost:${port}`);
})