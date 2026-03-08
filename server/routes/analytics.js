import express from "express";
import Expense from "../models/Expense.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Helper function to get month range
const getMonthRange = (year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate, endDate };
};

// Helper function to get year range
const getYearRange = (year) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
  return { startDate, endDate };
};

// Get monthly expense summary
router.get("/monthly/summary", authenticate, async (req, res) => {
  try {
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;

    const { startDate, endDate } = getMonthRange(parseInt(year), parseInt(month));

    // Get user's expenses and income
    const expenses = await Expense.find({
      paidBy: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    // Get user's shares in group expenses
    const sharedExpenses = await Expense.find({
      "splits.user": req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).populate("splits.user");

    let totalIncome = 0;
    let totalExpense = 0;
    let totalInvestment = 0;

    // Calculate totals
    expenses.forEach(exp => {
      if (exp.transactionType === 'income') {
        totalIncome += exp.amount;
      } else if (exp.transactionType === 'investment') {
        totalInvestment += exp.amount;
      } else {
        totalExpense += exp.amount;
      }
    });

    // Calculate what user owes/is owed from shared expenses
    let userOwedAmount = 0;
    let userOwesAmount = 0;

    sharedExpenses.forEach(exp => {
      if (exp.paidBy.toString() === req.user._id.toString()) {
        // User paid this, calculate their share
        const userSplit = exp.splits.find(s => s.user._id.toString() === req.user._id.toString());
        if (userSplit) {
          userOwedAmount += (exp.amount - userSplit.amount);
        }
      } else {
        // User owes this
        const userSplit = exp.splits.find(s => s.user._id.toString() === req.user._id.toString());
        if (userSplit) {
          userOwesAmount += userSplit.amount;
        }
      }
    });

    const netBalance = totalIncome - totalExpense;

    res.json({
      success: true,
      data: {
        month,
        year,
        summary: {
          totalIncome: parseFloat(totalIncome.toFixed(2)),
          totalExpense: parseFloat(totalExpense.toFixed(2)),
          totalInvestment: parseFloat(totalInvestment.toFixed(2)),
          netBalance: parseFloat(netBalance.toFixed(2)),
          userOwedAmount: parseFloat(userOwedAmount.toFixed(2)),
          userOwesAmount: parseFloat(userOwesAmount.toFixed(2))
        }
      }
    });
  } catch (error) {
    console.error("Get monthly summary error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching monthly summary"
    });
  }
});

// Get monthly analytics with category breakdown
router.get("/monthly/analytics", authenticate, async (req, res) => {
  try {
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;

    const { startDate, endDate } = getMonthRange(parseInt(year), parseInt(month));

    const expenses = await Expense.find({
      paidBy: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const categoryBreakdown = {};
    const paymentMethodBreakdown = {};

    expenses.forEach(exp => {
      // Category breakdown
      if (!categoryBreakdown[exp.category]) {
        categoryBreakdown[exp.category] = {
          income: 0,
          expense: 0,
          investment: 0,
          total: 0
        };
      }

      if (exp.transactionType === 'income') {
        categoryBreakdown[exp.category].income += exp.amount;
      } else if (exp.transactionType === 'investment') {
        categoryBreakdown[exp.category].investment += exp.amount;
      } else {
        categoryBreakdown[exp.category].expense += exp.amount;
      }

      categoryBreakdown[exp.category].total += exp.amount;

      // Payment method breakdown
      if (!paymentMethodBreakdown[exp.paymentMethod]) {
        paymentMethodBreakdown[exp.paymentMethod] = 0;
      }
      paymentMethodBreakdown[exp.paymentMethod] += exp.amount;
    });

    // Format category breakdown
    const formattedCategories = Object.keys(categoryBreakdown).map(cat => ({
      category: cat,
      income: parseFloat(categoryBreakdown[cat].income.toFixed(2)),
      expense: parseFloat(categoryBreakdown[cat].expense.toFixed(2)),
      investment: parseFloat(categoryBreakdown[cat].investment.toFixed(2)),
      total: parseFloat(categoryBreakdown[cat].total.toFixed(2))
    }));

    const formattedPaymentMethods = Object.keys(paymentMethodBreakdown).map(method => ({
      method,
      amount: parseFloat(paymentMethodBreakdown[method].toFixed(2))
    }));

    res.json({
      success: true,
      data: {
        month,
        year,
        categoryBreakdown: formattedCategories,
        paymentMethodBreakdown: formattedPaymentMethods
      }
    });
  } catch (error) {
    console.error("Get monthly analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching analytics"
    });
  }
});

// Get yearly report with trends
router.get("/yearly/report", authenticate, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const { startDate, endDate } = getYearRange(parseInt(year));

    const expenses = await Expense.find({
      paidBy: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const monthlyData = {};

    // Initialize months
    for (let i = 1; i <= 12; i++) {
      monthlyData[i] = {
        month: i,
        income: 0,
        expense: 0,
        investment: 0,
        netBalance: 0
      };
    }

    // Populate monthly data
    expenses.forEach(exp => {
      const month = new Date(exp.date).getMonth() + 1;
      if (exp.transactionType === 'income') {
        monthlyData[month].income += exp.amount;
      } else if (exp.transactionType === 'investment') {
        monthlyData[month].investment += exp.amount;
      } else {
        monthlyData[month].expense += exp.amount;
      }
    });

    // Calculate net balance for each month
    Object.keys(monthlyData).forEach(month => {
      monthlyData[month].netBalance = monthlyData[month].income - monthlyData[month].expense;
      monthlyData[month].income = parseFloat(monthlyData[month].income.toFixed(2));
      monthlyData[month].expense = parseFloat(monthlyData[month].expense.toFixed(2));
      monthlyData[month].investment = parseFloat(monthlyData[month].investment.toFixed(2));
      monthlyData[month].netBalance = parseFloat(monthlyData[month].netBalance.toFixed(2));
    });

    // Calculate yearly totals
    const yearlyTotals = {
      totalIncome: 0,
      totalExpense: 0,
      totalInvestment: 0,
      totalNetBalance: 0
    };

    Object.values(monthlyData).forEach(month => {
      yearlyTotals.totalIncome += month.income;
      yearlyTotals.totalExpense += month.expense;
      yearlyTotals.totalInvestment += month.investment;
      yearlyTotals.totalNetBalance += month.netBalance;
    });

    Object.keys(yearlyTotals).forEach(key => {
      yearlyTotals[key] = parseFloat(yearlyTotals[key].toFixed(2));
    });

    res.json({
      success: true,
      data: {
        year,
        monthlyData: Object.values(monthlyData),
        yearlyTotals
      }
    });
  } catch (error) {
    console.error("Get yearly report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching yearly report"
    });
  }
});

// Get spending insights and recommendations
router.get("/insights", authenticate, async (req, res) => {
  try {
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;

    const { startDate, endDate } = getMonthRange(parseInt(year), parseInt(month));

    const currentMonthExpenses = await Expense.find({
      paidBy: req.user._id,
      transactionType: 'expense',
      date: { $gte: startDate, $lte: endDate }
    });

    // Get previous 3 months for comparison
    const previousMonths = [];
    for (let i = 1; i <= 3; i++) {
      const prevMonth = parseInt(month) - i;
      const prevYear = prevMonth <= 0 ? parseInt(year) - 1 : parseInt(year);
      const adjustedMonth = prevMonth <= 0 ? prevMonth + 12 : prevMonth;
      previousMonths.push({ month: adjustedMonth, year: prevYear });
    }

    const previousExpenses = await Promise.all(
      previousMonths.map(async (m) => {
        const { startDate: pStartDate, endDate: pEndDate } = getMonthRange(m.year, m.month);
        const expenses = await Expense.find({
          paidBy: req.user._id,
          transactionType: 'expense',
          date: { $gte: pStartDate, $lte: pEndDate }
        });
        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        return total;
      })
    );

    const currentTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const averagePrevious = previousExpenses.reduce((a, b) => a + b, 0) / previousExpenses.length;

    const insights = [];
    let spendingTrend = 'stable';
    let trendPercentage = 0;

    if (currentTotal > averagePrevious * 1.1) {
      spendingTrend = 'increasing';
      trendPercentage = parseFloat(((currentTotal - averagePrevious) / averagePrevious * 100).toFixed(2));
      insights.push({
        type: 'warning',
        message: `Your spending increased by ${trendPercentage}% compared to your average.`,
        suggestion: 'Consider reducing expenses in high-spending categories.'
      });
    } else if (currentTotal < averagePrevious * 0.9) {
      spendingTrend = 'decreasing';
      trendPercentage = parseFloat(((averagePrevious - currentTotal) / averagePrevious * 100).toFixed(2));
      insights.push({
        type: 'success',
        message: `Great! Your spending decreased by ${trendPercentage}% compared to your average.`,
        suggestion: 'Keep up the good spending habits!'
      });
    }

    // Category analysis
    const categoryTotals = {};
    currentMonthExpenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const topCategory = Object.keys(categoryTotals).reduce((a, b) =>
      categoryTotals[a] > categoryTotals[b] ? a : b, null);

    if (topCategory && categoryTotals[topCategory] > currentTotal * 0.4) {
      insights.push({
        type: 'info',
        message: `${topCategory} accounts for ${parseFloat((categoryTotals[topCategory] / currentTotal * 100).toFixed(2))}% of your spending.`,
        suggestion: `Look for ways to optimize ${topCategory} expenses.`
      });
    }

    res.json({
      success: true,
      data: {
        month,
        year,
        spendingTrend,
        trendPercentage,
        currentMonthTotal: parseFloat(currentTotal.toFixed(2)),
        averagePreviousMonths: parseFloat(averagePrevious.toFixed(2)),
        insights
      }
    });
  } catch (error) {
    console.error("Get insights error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching insights"
    });
  }
});

// Get all user expenses (personal + group)
router.get("/user-expenses", authenticate, async (req, res) => {
  try {
    const { month, year, category, paymentMethod } = req.query;

    const filters = {
      paidBy: req.user._id,
      group: null // Only personal expenses
    };

    if (month && year) {
      const { startDate, endDate } = getMonthRange(parseInt(year), parseInt(month));
      filters.date = { $gte: startDate, $lte: endDate };
    }

    if (category) {
      filters.category = category;
    }

    if (paymentMethod) {
      filters.paymentMethod = paymentMethod;
    }

    const expenses = await Expense.find(filters)
      .sort({ date: -1 })
      .limit(100);

    res.json({
      success: true,
      data: {
        expenses
      }
    });
  } catch (error) {
    console.error("Get user expenses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user expenses"
    });
  }
});

export default router;
