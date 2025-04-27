import express from "express";

import { addCashBookEntry, getcashBookentriesbyMonth, getCashBookEntries, getMonthlySummary } from "../../controllers/financecontroller/cashBook.js";

const router = express.Router();

router.post("/addCashEntry", addCashBookEntry);
router.get("/getCashBook", getCashBookEntries);
router.get("/getCashBookMonth/:month/:year", getcashBookentriesbyMonth);
router.get("/monthly-summary", getMonthlySummary);

export default router;