import { Router } from "express";
import { getAdviceById, getAllAdvices, postAdvice } from './controllers/advice.controller'

const routes: Router = Router();



routes.get('/advices', getAllAdvices);
routes.post('/advice', postAdvice);
routes.get('/advice/:id', getAdviceById);

















export default routes;
