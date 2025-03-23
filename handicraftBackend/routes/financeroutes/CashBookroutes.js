import express from "express";

import { addCashBookEntry , getcashBookentriesbyMonth, getCashBookEntries } from "../../controllers/financecontroller/cashBook.js";

const router = express.Router();

router.post("/addCashEntry", addCashBookEntry);
router.get("/getCashBook", getCashBookEntries);
router.get("/getCashBookMonth/:month/:year", getcashBookentriesbyMonth);

export default router;