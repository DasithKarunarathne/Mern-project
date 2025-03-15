import express from "express";
import { addPettyCash,GetPettyCash,DeletePettycash } from "../controllers/pettycashController.js";


const router = express.Router();

router.post("/addPettyCash", addPettyCash);
router.get("/getPettyCash/:month/:year",GetPettyCash);
router.delete("/deletePettyCash/:id",DeletePettycash );
//updateeka danawada ???
export default router;