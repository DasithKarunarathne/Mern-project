import express from "express";
import {salarycalculation, getsalaries, markSalPaid} from "../controllers/salaryController.js"

const router = express.Router();

router.post("/calculate", salarycalculation);
router.get("/:month", getsalaries);//:month???
router.put("/markPaid/:salaryId",markSalPaid);

export default router;