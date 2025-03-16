import express from "express";
import { addPettyCash,GetPettyCash,DeletePettycash,UpdatepettyCash } from "../controllers/pettycashController.js";


const router = express.Router();

router.post("/addPettyCash", addPettyCash);
router.get("/getPettyCash/:month/:year",GetPettyCash);
router.delete("/deletePettyCash/:id",DeletePettycash );
router.put("/UpdatePettyCash/:id",UpdatepettyCash);
//updateeka danawada ???
export default router;