// controllers/financialsController.js
import { getMonthRange } from '../../util/getMonthRange.js'; // Utility function
import CashBalance from '../../models/financemodel/CashBalance.js';
import Order from '../../models/productmodel/Order.js';
import Salary from '../../models/financemodel/Salary.js';
import Ledger from '../../models/financemodel/Ledger.js';



// Generate Profit and Loss
export async function generateProfitLoss(year, month) {
  const { startDate, endDate } = getMonthRange(year, month);

  const orderRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate }, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);

  const salaryExpenses = await Salary.aggregate([
    { $match: { paymentDate: { $gte: startDate, $lte: endDate }, status: 'Completed' } },
    { $group: { _id: null, total: { $sum: '$netSalary' } } },
  ]);

  const pettyCashExpenses = await Ledger.aggregate([
    {
      $match: { date: { $gte: startDate, $lte: endDate }, source: 'Petty Cash', amount: { $lt: 0 } },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const totalRevenue = orderRevenue.length > 0 ? orderRevenue[0].total : 0;
  const totalSalary = salaryExpenses.length > 0 ? salaryExpenses[0].total : 0;
  const totalPettyCash = pettyCashExpenses.length > 0 ? Math.abs(pettyCashExpenses[0].total) : 0;
  const totalExpenses = totalSalary + totalPettyCash;
  const netProfit = totalRevenue - totalExpenses;

  return {
    revenue: totalRevenue,
    expenses: { salaries: totalSalary, pettyCash: totalPettyCash, total: totalExpenses },
    netProfit,
  };
}

// Generate Statement of Financial Position
export async function generateSOFP(year, month) {
  const { startDate, endDate } = getMonthRange(year, month);

  const cashBalance = await CashBalance.findOne({ lastUpdated: { $lte: endDate } }).sort({
    lastUpdated: -1,
  });
  const cash = cashBalance ? cashBalance.balance : 0;

  const receivables = await Order.aggregate([
    { $match: { createdAt: { $lte: endDate }, status: 'pending' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const totalReceivables = receivables.length > 0 ? receivables[0].total : 0;

  const totalAssets = cash + totalReceivables;

  const unpaidSalaries = await Salary.aggregate([
    {
      $match: {  createdAt: { $lte: endDate }, status: 'Pending' },
    },
    { $group: { _id: null, total: { $sum: '$netSalary' } } },
  ]);
  const totalLiabilities = unpaidSalaries.length > 0 ? unpaidSalaries[0].total : 0;

  const equity = totalAssets - totalLiabilities;

  return {
    assets: { cash, receivables: totalReceivables, total: totalAssets },
    liabilities: { unpaidSalaries: totalLiabilities, total: totalLiabilities },
    equity,
  };
}

// API route handlers
export const getProfitLoss = async (req, res) => {
  const { year, month } = req.query;
  try {
    const plStatement = await generateProfitLoss(parseInt(year), parseInt(month));
    res.json(plStatement);
  } catch (error) {
    console.error('Error generating P/L:', error);
    res.status(500).json({ error: 'Failed to generate P/L' });
  }
};

export const getSOFP = async (req, res) => {
  const { year, month } = req.query;
  try {
    const sofp = await generateSOFP(parseInt(year), parseInt(month));
    res.json(sofp);
  } catch (error) {
    console.error('Error generating SOFP:', error);
    res.status(500).json({ error: 'Failed to generate SOFP' });
  }
};