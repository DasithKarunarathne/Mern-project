import express from "express";
import {salarycalculation} from "../controllers/salaryController.js"

const router = express.Router();

router.post("/calculateSal/", salarycalculation);

export default router;