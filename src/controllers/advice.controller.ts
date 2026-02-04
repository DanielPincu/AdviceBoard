import { Request, Response } from 'express';
import { AdviceModel } from '../models/advice.model';
// DB connection is handled at app startup/shutdown

export async function getAllAdvices(req: Request, res: Response) {

    try {

        const result = await AdviceModel.find({});
        
        res.json(result);
    }

    catch (error) {
        res.status(500).json({ message: 'Error getting all advices', error });
    }

}

export async function postAdvice(req: Request, res: Response): Promise<void> {

    const data = req.body;

    try {

        const advice = new AdviceModel(data);
        const result = await advice.save();
        
        res.status(201).json(result);
    }

    catch (error) {
        res.status(500).json({ message: 'Error posting advice', error });
    }

}

export async function getAdviceById(req: Request, res: Response) {

    try {

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

}

export async function deleteAdviceById(req: Request, res: Response) {

    try {

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

}


export async function updateAdviceById(req: Request, res: Response) {

    try {

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

}

export async function addReply(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { content, anonymous, _createdBy } = req.body;

        if (!content) {
            res.status(400).json({ message: 'Reply content is required' });
            return;
        }

        if (anonymous === false && !_createdBy) {
            res.status(400).json({ message: 'User id is required when reply is not anonymous' });
            return;
        }

        const advice = await AdviceModel.findById(id);

        if (!advice) {
            res.status(404).json({ message: 'Advice not found' });
            return;
        }

        advice.replies.push({
            content,
            createdAt: new Date(),
            anonymous: Boolean(anonymous),
            _createdBy: _createdBy
        } as any);

        await advice.save();

        res.status(201).json(advice);
    } catch (error) {
        res.status(500).json({ message: 'Error adding reply', error });
    }
}

export async function deleteReplyById(req: Request, res: Response) {
    try {
        const { adviceId, replyId } = req.params;

        const advice = await AdviceModel.findById(adviceId);

        if (!advice) {
            res.status(404).json({ message: 'Advice not found' });
            return;
        }

        const replyIndex = advice.replies.findIndex(
            (r: any) => String(r._id) === String(replyId)
        );

        if (replyIndex === -1) {
            res.status(404).json({ message: 'Reply not found' });
            return;
        }

        advice.replies.splice(replyIndex, 1);
        await advice.save();

        res.json({ message: 'Reply deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting reply', error });
    }
}