import express from "express";

import { fetchLedger } from "../../controllers/financecontroller/Ledger.js";

const router = express.Router();

router.get("/fetchLedger/:month/:year", fetchLedger);

export default router;