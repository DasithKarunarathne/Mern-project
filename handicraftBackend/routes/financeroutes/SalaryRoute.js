import express from "express";
import { salarycalculation, getsalaries, markSalPaid, getTotalSalariesPaid } from "../../controllers/financecontroller/salaryController.js";

const router = express.Router();

router.post("/salarycalculation", salarycalculation);
router.get("/getsalaries/:month", getsalaries);
router.put("/markSalPaid/:salaryId", markSalPaid);
router.get("/total-paid", getTotalSalariesPaid);

export default router; 