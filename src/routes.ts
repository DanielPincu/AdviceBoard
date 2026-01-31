import { Router } from "express";
import { getAllAdvices } from './controllers/advice.controller'

const routes: Router = Router();



routes.get('/advices', getAllAdvices);
















export default routes;
