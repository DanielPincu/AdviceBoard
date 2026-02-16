import { Types } from 'mongoose';
import { Request, Response } from 'express';
import { adviceModel } from '../models/advice.model';
import { sanitizeAdvice } from '../utils/sanitizeAdvice';
import { buildDynamicQuery } from './dynamicQueryBuilder';


async function findAndPopulateAdvice(id: string | Types.ObjectId) {
  return adviceModel
    .findById(id)
    .populate('_createdBy', 'username')
    .populate('replies._createdBy', 'username')
}

function getUserId(req: Request): string | undefined {
  return (req as any).user?.id
}

function forbidden(res: Response, message: string) {
  res.status(403).json({ message })
}

function notFound(res: Response, message: string) {
  res.status(404).json({ message })
}
// DB connection is handled at app startup/shutdown

export async function getAllAdvices(req: Request, res: Response) {

    try {
        const result = await adviceModel
            .find({})
            .populate('_createdBy', 'username')
            .populate('replies._createdBy', 'username')
            .sort({ createdAt: -1 });
        const myUserId = getUserId(req)
        res.json(result.map(a => sanitizeAdvice(a, myUserId)));
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

        const userId = getUserId(req)

        const advice = new adviceModel({
            title,
            content,
            anonymous,
            _createdBy: userId,
        })

        const saved = await advice.save()
        const populated = await findAndPopulateAdvice(saved._id)
        res.status(201).json(sanitizeAdvice(populated, getUserId(req)))
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

        const rawId = req.params.id
        const id = Array.isArray(rawId) ? rawId[0] : rawId
        const result = await findAndPopulateAdvice(id)

        if (!result) {
          notFound(res, 'Advice not found')
          return
        }

        res.json(sanitizeAdvice(result, getUserId(req)));
    }

    catch (error) {
        res.status(500).json({ message: 'Error getting advice by ID', error });
    }

}


export async function searchAdvices(req: Request, res: Response) {
  try {
    const q = String(req.query.q || '').trim()
    const key = String(req.query.key || '').trim()
    const value = req.query.value

    let filter = {}

    if (q) {
      filter = buildDynamicQuery(adviceModel, { key: 'q', value: q })
    } else if (key && value !== undefined) {
      filter = buildDynamicQuery(adviceModel, { key, value })
    } else {
      return res.status(400).json({
        message: 'Provide ?q=... OR ?key=...&value=...',
      })
    }

    const results = await adviceModel
      .find(filter)
      .populate('_createdBy', 'username')
      .populate('replies._createdBy', 'username')

    const myUserId = getUserId(req)
    res.json(results.map(a => sanitizeAdvice(a, myUserId)))
  } catch (error) {
    console.error('searchAdvices error:', error)
    res.status(500).json({ message: 'Error searching advices' })
  }
}




export async function deleteAdviceById(req: Request, res: Response) {
  try {
    const rawId = req.params.id
    const id = Array.isArray(rawId) ? rawId[0] : rawId
    const userId = getUserId(req)

    const advice = await adviceModel.findById(id)

    if (!advice) {
      notFound(res, 'Advice not found')
      return
    }

    if (!advice._createdBy || String(advice._createdBy) !== String(userId)) {
      forbidden(res, 'You can only delete your own advice')
      return
    }

    await advice.deleteOne()
    res.json({ message: 'Advice deleted' })
  } catch (error) {
    console.error('deleteAdviceById error:', error)
    res.status(500).json({ message: 'Error deleting advice by ID' })
  }
}


export async function updateAdviceById(req: Request, res: Response) {
  try {
    const rawId = req.params.id
    const id = Array.isArray(rawId) ? rawId[0] : rawId
    const userId = getUserId(req)

    const advice = await adviceModel.findById(id)

    if (!advice) {
      notFound(res, 'Advice not found')
      return
    }

    if (!advice._createdBy || String(advice._createdBy) !== String(userId)) {
      forbidden(res, 'You can only edit your own advice')
      return
    }

    const { title, content, anonymous } = req.body

    if (typeof title === 'string') advice.title = title
    if (typeof content === 'string') advice.content = content
    if (typeof anonymous === 'boolean') advice.anonymous = anonymous

    const saved = await advice.save()

    const populated = await findAndPopulateAdvice(saved._id)
    res.status(200).json(sanitizeAdvice(populated, getUserId(req)))
  } catch (error: any) {
    if (error?.name === 'ValidationError') {
      res.status(400).json({ message: 'Validation failed', errors: error.errors })
      return
    }
    console.error('updateAdviceById error:', error)
    res.status(500).json({ message: 'Error updating advice by ID' })
  }
}

export async function addReply(req: Request, res: Response) {
    try {
        const rawId = req.params.id
        const id = Array.isArray(rawId) ? rawId[0] : rawId
        const { content, anonymous } = req.body

        if (!content) {
            res.status(400).json({ message: 'Reply content is required' })
            return
        }

        if (typeof anonymous !== 'boolean') {
            res.status(400).json({ message: 'anonymous must be true or false' })
            return
        }

        const userId = getUserId(req)

        const advice = await adviceModel.findById(id)

        if (!advice) {
            res.status(404).json({ message: 'Advice not found' })
            return
        }

        advice.replies.push({
            content,
            createdAt: new Date(),
            anonymous,
            _createdBy: userId,
        } as any)

        await advice.save()

        const populated = await findAndPopulateAdvice(advice._id)
        res.status(201).json(sanitizeAdvice(populated, getUserId(req)))
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
    const rawAdviceId = req.params.adviceId
    const rawReplyId = req.params.replyId
    const adviceId = Array.isArray(rawAdviceId) ? rawAdviceId[0] : rawAdviceId
    const replyId = Array.isArray(rawReplyId) ? rawReplyId[0] : rawReplyId

    const userId = getUserId(req)

    const advice = await adviceModel.findById(adviceId)

    if (!advice) {
      notFound(res, 'Advice not found')
      return
    }

    const reply = (advice.replies as any).id(replyId)

    if (!reply) {
      res.status(404).json({ message: 'Reply not found' })
      return
    }

    if (!reply._createdBy || String(reply._createdBy) !== String(userId)) {
      forbidden(res, 'You can only delete your own reply')
      return
    }

    reply.deleteOne()
    await advice.save()

    const populated = await findAndPopulateAdvice(advice._id)
    res.status(200).json(sanitizeAdvice(populated, getUserId(req)))
  } catch (error) {
    console.error('deleteReplyById error:', error)
    res.status(500).json({ message: 'Error deleting reply' })
  }
}

export async function updateReplyById(req: Request, res: Response) {
  try {
    const rawAdviceId = req.params.adviceId
    const rawReplyId = req.params.replyId
    const adviceId = Array.isArray(rawAdviceId) ? rawAdviceId[0] : rawAdviceId
    const replyId = Array.isArray(rawReplyId) ? rawReplyId[0] : rawReplyId

    const userId = getUserId(req)
    const { content, anonymous } = req.body

    if (typeof content !== 'string' && typeof anonymous !== 'boolean') {
      res.status(400).json({ message: 'Nothing to update' })
      return
    }

    const advice = await adviceModel.findById(adviceId)

    if (!advice) {
      notFound(res, 'Advice not found')
      return
    }

    const reply = (advice.replies as any).id(replyId)

    if (!reply) {
      res.status(404).json({ message: 'Reply not found' })
      return
    }

    if (!reply._createdBy || String(reply._createdBy) !== String(userId)) {
      forbidden(res, 'You can only edit your own reply')
      return
    }

    if (typeof content === 'string') reply.content = content
    if (typeof anonymous === 'boolean') reply.anonymous = anonymous

    await advice.save()

    const populated = await findAndPopulateAdvice(advice._id)
    res.status(200).json(sanitizeAdvice(populated, getUserId(req)))
  } catch (error: any) {
    if (error?.name === 'ValidationError') {
      res.status(400).json({ message: 'Validation failed', errors: error.errors })
      return
    }
    console.error('updateReplyById error:', error)
    res.status(500).json({ message: 'Error updating reply' })
  }
}