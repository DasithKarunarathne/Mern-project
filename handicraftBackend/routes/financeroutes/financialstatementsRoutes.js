// routes/financialsRoutes.js
import express from 'express';
import { getProfitLoss, getSOFP } from '../../controllers/financecontroller/financialStatements.js';

const router = express.Router();

router.get('/profit-loss', getProfitLoss);
router.get('/sofp', getSOFP);

export default router;