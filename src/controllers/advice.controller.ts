import { Request, Response } from 'express';
import { AdviceModel } from '../models/advice.model';
import { connect, disconnect } from '../driver/mongo.driver'

export async function getAllAdvices(req: Request, res: Response) {

    try {

        await connect();

        const result = await AdviceModel.find({});
        
        res.json(result);
    }

    catch (error) {
        res.status(500).json({ message: 'Error getting all advices', error });
    }

    finally {
        await disconnect();
    }

}