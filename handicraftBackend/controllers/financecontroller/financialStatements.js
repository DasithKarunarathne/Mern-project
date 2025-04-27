// controllers/financialsController.js
import { getMonthRange } from '../../util/getMonthRange.js'; // Utility function
import CashBalance from '../../models/financemodel/CashBalance.js';
import Order from '../../models/productmodel/Order.js';
import Salary from '../../models/financemodel/Salary.js';
import Ledger from '../../models/financemodel/Ledger.js';
import PettycashBalance from '../../models/financemodel/PettycashBalance.js';



// Generate Profit and Loss
export async function generateProfitLoss(year, month) {
  const { startDate, endDate } = getMonthRange(year, month);

  const orderRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate }, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);

  const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
  const salaryExpenses = await Salary.aggregate([
    { $match: { month: monthStr } },
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
    expenses: { 
      salaries: totalSalary, 
      pettyCash: totalPettyCash, 
      total: totalExpenses,
      details: {
        salaryCount: salaryExpenses.length > 0 ? salaryExpenses[0].count : 0,
        pettyCashCount: pettyCashExpenses.length > 0 ? pettyCashExpenses[0].count : 0
      }
    },
    netProfit,
  };
}

// Generate Statement of Financial Position
export async function generateSOFP(year, month) {
  const { startDate, endDate } = getMonthRange(year, month);

  // 1. Cash and Cash Equivalents
  const cashBalance = await CashBalance.findOne({ lastUpdated: { $lte: endDate } }).sort({
    lastUpdated: -1,
  });
  const cash = cashBalance ? cashBalance.balance : 0;

  // 2. Receivables - Improved to distinguish current and long-term
  const currentReceivables = await Order.aggregate([
    { 
      $match: { 
        createdAt: { $lte: endDate }, 
        status: 'pending',
        dueDate: { $lte: new Date(endDate.getTime() + 30 * 24 * 60 * 60 * 1000) } // Due within 30 days
      } 
    },
    { $group: { _id: null, total: { $sum: '$remainingBalance' } } },
  ]);
  const totalCurrentReceivables = currentReceivables.length > 0 ? currentReceivables[0].total : 0;

  const longTermReceivables = await Order.aggregate([
    { 
      $match: { 
        createdAt: { $lte: endDate }, 
        status: 'pending',
        dueDate: { $gt: new Date(endDate.getTime() + 30 * 24 * 60 * 60 * 1000) } // Due after 30 days
      } 
    },
    { $group: { _id: null, total: { $sum: '$remainingBalance' } } },
  ]);
  const totalLongTermReceivables = longTermReceivables.length > 0 ? longTermReceivables[0].total : 0;

  // 3. Inventory (if you have an inventory model)
  // This is a placeholder - you would need to implement your inventory model
  const inventory = 0; // Replace with actual inventory calculation

  // Calculate total current assets
  const currentAssets = cash + totalCurrentReceivables;
  
  // Calculate total non-current assets
  const nonCurrentAssets = totalLongTermReceivables + inventory;
  
  // Total assets
  const totalAssets = currentAssets + nonCurrentAssets;

  // 4. Current Liabilities
  // 4.1 Unpaid Salaries
  const unpaidSalaries = await Salary.aggregate([
    {
      $match: {
        dueDate: { $lte: endDate },
        $or: [
          { status: 'Pending' },
          {
            status: 'Completed',
            paymentDate: { $gt: endDate }
          }
        ]
      }
    },
    { $group: { _id: null, total: { $sum: '$netSalary' } } }
  ]);
  const totalUnpaidSalaries = unpaidSalaries.length > 0 ? unpaidSalaries[0].total : 0;

  // 4.2 Unpaid Orders (if you have purchase orders)
  // This is a placeholder - you would need to implement your purchase order model
  const unpaidOrders = 0; // Replace with actual unpaid orders calculation

  // Calculate total current liabilities
  const currentLiabilities = totalUnpaidSalaries + unpaidOrders;

  // 5. Non-Current Liabilities (if any)
  // This is a placeholder - you would need to implement your long-term liabilities model
  const nonCurrentLiabilities = 0; // Replace with actual non-current liabilities calculation

  // Total liabilities
  const totalLiabilities = currentLiabilities + nonCurrentLiabilities;

  // 6. Equity
  // 6.1 Calculate accumulated profit/loss
  let accumulatedProfitLoss = 0;
  
  // Get all profit/loss statements from the beginning of the year
  const yearStartDate = new Date(year, 0, 1);
  
  // Get all completed months up to the current month
  for (let m = 1; m <= month; m++) {
    const plStatement = await generateProfitLoss(year, m);
    accumulatedProfitLoss += plStatement.netProfit;
  }

  // 6.2 Initial capital (if you track this)
  // This is a placeholder - you would need to implement your capital tracking
  const initialCapital = 0; // Replace with actual initial capital

  // Calculate total equity
  const equity = initialCapital + accumulatedProfitLoss;

  // Verify the accounting equation
  const accountingEquation = Math.abs(totalAssets - (totalLiabilities + equity)) < 0.01;
  if (!accountingEquation) {
    console.warn("Warning: Accounting equation does not balance!");
  }

  return {
    assets: { 
      current: { 
        cash,
        receivables: totalCurrentReceivables, 
        total: currentAssets 
      },
      nonCurrent: {
        longTermReceivables: totalLongTermReceivables,
        inventory,
        total: nonCurrentAssets
      },
      total: totalAssets 
    },
    liabilities: { 
      current: { 
        unpaidSalaries: totalUnpaidSalaries,
        unpaidOrders,
        total: currentLiabilities 
      },
      nonCurrent: {
        total: nonCurrentLiabilities
      },
      total: totalLiabilities 
    },
    equity: {
      initialCapital,
      accumulatedProfitLoss,
      total: equity
    },
    accountingEquationBalanced: accountingEquation
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