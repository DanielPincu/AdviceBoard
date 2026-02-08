import { Router } from "express";
import { 
    getAdviceById, 
    getAllAdvices, 
    postAdvice, 
    deleteAdviceById, 
    updateAdviceById,
    addReply,
    deleteReplyById
} from './controllers/advice.controller'
import { registerUser, loginUser } from './controllers/auth.controller'
import { verifyToken } from './middleware/auth.middleware'

const routes: Router = Router();

// Auth (public)
routes.post('/user/register', registerUser);
routes.post('/user/login', loginUser);

// Advices (public)
routes.get('/advices', getAllAdvices);
routes.get('/advices/:id', getAdviceById);

// Advices (protected)
routes.post('/advices', verifyToken, postAdvice);
routes.delete('/advices/:id', verifyToken, deleteAdviceById);
routes.put('/advices/:id', verifyToken, updateAdviceById);

// Replies (protected)
routes.post('/advices/:id/replies', verifyToken, addReply);
routes.delete('/advices/:adviceId/replies/:replyId', verifyToken, deleteReplyById);


export default routes;
