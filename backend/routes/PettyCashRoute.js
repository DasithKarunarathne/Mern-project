import express from "express";
import { addPettyCash,GetPettyCash } from "../controllers/pettycashController.js";


const router = express.Router();

router.post("/addPettyCash", addPettyCash);
router.get("/getPettyCash",GetPettyCash);


export default router;