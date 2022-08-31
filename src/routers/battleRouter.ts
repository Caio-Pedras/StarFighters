import { Router } from "express";
import {postBattle, getRanking} from "../controllers/battleController.js";

const battleRouter = Router();

battleRouter.post("/battle", postBattle);
battleRouter.get("/ranking", getRanking);

export default battleRouter;
