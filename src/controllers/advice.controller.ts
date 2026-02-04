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

export async function postAdvice(req: Request, res: Response): Promise<void> {

    const data = req.body;

    try {

        await connect();

        const advice = new AdviceModel(data);
        const result = await advice.save();
        
        res.status(201).json(result);
    }

    catch (error) {
        res.status(500).json({ message: 'Error posting advice', error });
    }

    finally {
        await disconnect();
    }

}

export async function getAdviceById(req: Request, res: Response) {

    try {

        await connect();

        const id = req.params.id;
        const result = await AdviceModel.findById(id);

        if (!result) {
           res.status(404).json({ message: 'Advice not found' })
            return;
        }

        res.json(result);
    }

    catch (error) {
        res.status(500).json({ message: 'Error getting advice by ID', error });
    }

    finally {
        await disconnect();
    }

}

export async function deleteAdviceById(req: Request, res: Response) {

    try {

        await connect();

        const id = req.params.id;
        const result = await AdviceModel.findByIdAndDelete(id);

        if (!result) {
            res.status(404).json({ message: 'Advice not found' });
            return;
        }

        res.json({
            message: 'Advice deleted'
        });
        
        
    }

    catch (error) {
        res.status(500).json({ message: 'Error deleting advice by ID', error });
    }

    finally {
        await disconnect();
    }

}


export async function updateAdviceById(req: Request, res: Response) {

    try {

        await connect();

        const id = req.params.id;
        const result = await AdviceModel.findByIdAndUpdate(id, req.body, { new: true });

        if (!result) {
            res.status(404).json({ message: 'Advice not found' });
            return;
        }

        res.json({
            message: 'Advice updated',
            data: result
        });
        
        
    }

    catch (error) {
        res.status(500).json({ message: 'Error updating advice by ID', error });
    }

    finally {
        await disconnect();
    }

}