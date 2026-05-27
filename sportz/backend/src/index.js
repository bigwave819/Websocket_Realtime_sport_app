import express from 'express'

const app = express();
const port = 8000;


app.use(express.json())


app.get('/', (req, res) => {
    console.log(`the server is running at http://localhost:${port}`);
})