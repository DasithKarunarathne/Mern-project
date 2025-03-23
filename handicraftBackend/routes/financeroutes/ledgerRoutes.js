import express from "express";

import { fetchLedger } from "../../controllers/financecontroller/Ledger";

const router = express.Router();

router.get("/fetchLedger/:month/:year", fetchLedger);

export default router;