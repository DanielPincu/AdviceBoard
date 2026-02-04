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

const routes: Router = Router();

routes.post('/advice', postAdvice);
routes.get('/advices', getAllAdvices);
routes.get('/advices/:id', getAdviceById);
routes.delete('/advices/:id', deleteAdviceById);
routes.put('/advices/:id', updateAdviceById);

// Replies
routes.post('/advices/:id/replies', addReply);
routes.delete('/advices/:adviceId/replies/:replyId', deleteReplyById);


export default routes;
