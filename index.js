import express from 'express'
import dotenv from 'dotenv';
import bootstrap from './src/app.controller.js';
dotenv.config();
const app = express()
const port = process.env.PORT || 5000;

bootstrap({ app, express });




app.listen(port, () => console.log(`server running on port ${port}`));