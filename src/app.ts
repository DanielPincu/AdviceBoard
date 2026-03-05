import express, { Application, Request, Response } from 'express';
import dotenfFlow from 'dotenv-flow';
import routes from './routes';
import { connect, disconnect } from './driver/mongo.driver';
import cors from 'cors';

// Load environment variables from .env files
dotenfFlow.config();

const app: Application = express();

function setupCors() {
    const origins = (process.env.CORS_ORIGINS || '')
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);

    app.use(cors({
        origin: (origin, cb) => {
            if (!origin || origins.includes(origin)) {
                cb(null, true);
            } else {
                cb(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
}


export async function startServer() {

    setupCors();

    app.use(express.json());
    //Handle invalid JSON error, like trailing commas...
    app.use((err: any, req: Request, res: Response, next: Function) => {
        if (err instanceof SyntaxError && 'body' in err) {
            return res.status(400).json({ message: 'Invalid JSON body' });
        }
        next(err);
    });

    app.use('/api', routes);

    await connect();

    const PORT: number = parseInt(process.env.PORT as string);
    app.listen(PORT, function () {
        console.log("Server is running on port: " + PORT);
    });

    process.on('SIGINT', async () => {
        try {
            await disconnect();
        } finally {
            process.exit(0);
        }
    });

    process.on('SIGTERM', async () => {
        try {
            await disconnect();
        } finally {
            process.exit(0);
        }
    });

}
