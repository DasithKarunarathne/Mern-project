import express from "express";
import { addPettyCash, getPettyCash, deletePettyCash, updatePettyCash, getSuggestedReimbursement } from "../../controllers/financecontroller/pettycashController.js";

const router = express.Router();

router.post("/addPettyCash", addPettyCash);
router.get("/getPettyCash/:month/:year", getPettyCash);
router.delete("/deletePettyCash/:id", deletePettyCash); // Updated casing, query params handled in controller
router.put("/updatePettyCash/:id", updatePettyCash); // Updated casing
router.get("/suggested-reimbursement", getSuggestedReimbursement);

export default router;