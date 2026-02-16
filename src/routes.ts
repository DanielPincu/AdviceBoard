import { Router } from "express";
import { 
    getAdviceById, 
    getAllAdvices, 
    postAdvice, 
    deleteAdviceById, 
    updateAdviceById,
    addReply,
    deleteReplyById,
    updateReplyById,
    searchAdvices,
} from './controllers/advice.controller'

import { registerUser, loginUser } from './controllers/auth.controller'
import { verifyToken } from './middleware/auth.middleware'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './documentation/doc'

const routes: Router = Router();

// Welcome (public)
routes.get('/ok', (_req, res) => {
  res.json({ message: 'Welcome to Windows Vista Troubles... Troubleshooting! 👋', status: 'ok' })
});

/**
 * Swagger docs
 */
routes.get('/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

routes.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Auth (public)
routes.post('/user/register', registerUser);
routes.post('/user/login', loginUser);

// Advices (protected)
routes.get('/advices', verifyToken, getAllAdvices);
routes.get('/advices/search', verifyToken, searchAdvices);
routes.get('/advices/:id', verifyToken, getAdviceById);

// Advices (protected)
routes.post('/advices', verifyToken, postAdvice);
routes.delete('/advices/:id', verifyToken, deleteAdviceById);
routes.put('/advices/:id', verifyToken, updateAdviceById);

// Replies (protected)
routes.post('/advices/:id/replies', verifyToken, addReply);
routes.delete('/advices/:adviceId/replies/:replyId', verifyToken, deleteReplyById);
routes.put('/advices/:adviceId/replies/:replyId', verifyToken, updateReplyById);


export default routes;
