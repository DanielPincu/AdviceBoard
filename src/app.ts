import express, { Application, Request, Response } from 'express';
import dotenfFlow from 'dotenv-flow';
import routes from './routes';
import { connect, disconnect } from './driver/mongo.driver';
import cors from 'cors';

// Load environment variables from .env files
dotenfFlow.config();

const app: Application = express();

function setupCors() {
    app.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['auth-token', 'Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
        credentials: true,
    }));
}


export function startServer() {

    setupCors();

    app.use(express.json());

    app.use('/api', routes);

    connect();

    const PORT: number = parseInt(process.env.PORT as string);
    app.listen(process.env.PORT, function(){
        console.log("Server is running on port: " + process.env.PORT);
    })

    disconnect();

}
