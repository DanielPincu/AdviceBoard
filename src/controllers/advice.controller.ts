import { Request, Response } from 'express';
import { AdviceModel } from '../models/advice.model';
// DB connection is handled at app startup/shutdown

export async function getAllAdvices(req: Request, res: Response) {

    try {

        const result = await AdviceModel
            .find({})
            .populate('_createdBy', 'username')
            .populate('replies._createdBy', 'username')
            .sort({ createdAt: -1 });
        
        res.json(result);
    }

    catch (error) {
        res.status(500).json({ message: 'Error getting all advices', error });
    }

}

export async function postAdvice(req: Request, res: Response): Promise<void> {
    try {
        const { title, content, anonymous } = req.body

        if (!title || !content || typeof anonymous !== 'boolean') {
            res.status(400).json({ message: 'title, content and anonymous are required' })
            return
        }

        const userId = (req as any).user?.id

        const advice = new AdviceModel({
            title,
            content,
            anonymous,
            _createdBy: anonymous ? undefined : userId,
        })

        const saved = await advice.save()
        const populated = await saved.populate('_createdBy', 'username')
        res.status(201).json(populated)
    } catch (error: any) {
        if (error?.name === 'ValidationError') {
            res.status(400).json({
                message: 'Validation failed',
                errors: error.errors,
            })
            return
        }
        console.error('postAdvice error:', error)
        res.status(500).json({ message: 'Error posting advice' })
    }
}

export async function getAdviceById(req: Request, res: Response) {

    try {

        const id = req.params.id;
        const result = await AdviceModel
            .findById(id)
            .populate('_createdBy', 'username')
            .populate('replies._createdBy', 'username');

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
        const result = await AdviceModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

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
        const { id } = req.params
        const { content, anonymous } = req.body

        if (!content) {
            res.status(400).json({ message: 'Reply content is required' })
            return
        }

        if (typeof anonymous !== 'boolean') {
            res.status(400).json({ message: 'anonymous must be true or false' })
            return
        }

        const userId = (req as any).user?.id

        const advice = await AdviceModel.findById(id)

        if (!advice) {
            res.status(404).json({ message: 'Advice not found' })
            return
        }

        advice.replies.push({
            content,
            createdAt: new Date(),
            anonymous,
            _createdBy: anonymous ? undefined : userId,
        } as any)

        await advice.save()

        const populated = await AdviceModel
            .findById(advice._id)
            .populate('_createdBy', 'username')
            .populate('replies._createdBy', 'username')

        res.status(201).json(populated)
    } catch (error: any) {
        if (error?.name === 'ValidationError') {
            res.status(400).json({
                message: 'Validation failed',
                errors: error.errors,
            })
            return
        }
        console.error('addReply error:', error)
        res.status(500).json({ message: 'Error adding reply' })
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