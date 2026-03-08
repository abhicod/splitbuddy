import express from "express";
import { body, validationResult } from "express-validator";
import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
import User from "../models/User.js";
import Settlement from "../models/Settlement.js";
import { authenticate } from "../middleware/auth.js";
import { sendMail } from "../utils/mailer.js";

const router = express.Router();

// Helper function to calculate splits
const calculateSplits = (amount, splitType, members, customSplits = []) => {
  let splits = [];

  switch (splitType) {
    case "equal":
      const equalAmount = amount / members.length;
      splits = members.map((member) => ({
        user: member,
        amount: equalAmount,
        paid: false,
      }));
      break;

    case "exact":
      splits = customSplits.map((split) => ({
        user: split.user,
        amount: split.amount,
        paid: false,
      }));
      break;

    case "percentage":
      splits = customSplits.map((split) => ({
        user: split.user,
        amount: (amount * split.percentage) / 100,
        percentage: split.percentage,
        paid: false,
      }));
      break;

    default:
      throw new Error("Invalid split type");
  }

  return splits;
};

// Create new expense
router.post(
  "/",
  authenticate,
  [
    body("title")
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Title must be between 1 and 200 characters"),
    body("amount")
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be greater than 0"),
    body("splitType")
      .isIn(["equal", "exact", "percentage"])
      .withMessage("Invalid split type"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        title,
        description,
        amount,
        currency,
        category,
        transactionType,
        paymentMethod,
        groupId,
        splitType,
        members,
        customSplits,
        receipt,
        date,
        notes,
        paidBy,
        tags,
      } = req.body;

      // If groupId is provided, verify group exists and user is member
      let group = null;
      if (groupId) {
        group = await Group.findOne({
          _id: groupId,
          "members.user": req.user._id,
          isActive: true,
        }).populate('members.user', 'name email avatar');

        if (!group) {
          return res.status(404).json({
            success: false,
            message: "Group not found or you are not a member",
          });
        }

        // Validate paidBy user
        const paidByUserId = paidBy || req.user._id;
        const isPaidByMember = group.members.some((member) => {
          const memberId =
            member?.user && typeof member.user === 'object' && member.user._id
              ? member.user._id
              : member.user;
          return memberId?.toString() === paidByUserId.toString();
        });

        if (!isPaidByMember) {
          return res.status(400).json({
            success: false,
            message: "The person who paid must be a member of the group",
          });
        }
      }

      // Validate members array exists and has at least one member
      if (!members || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one member is required for splitting",
        });
      }

      // Calculate splits
      const splits = calculateSplits(amount, splitType, members, customSplits);

      // Validate splits
      const totalSplitAmount = splits.reduce(
        (sum, split) => sum + split.amount,
        0
      );
      if (Math.abs(totalSplitAmount - amount) > 0.01) {
        return res.status(400).json({
          success: false,
          message: "Split amounts do not match total expense amount",
        });
      }

      // Create expense
      const paidByUserId = paidBy || req.user._id;
      const expense = new Expense({
        title,
        description,
        amount,
        currency: currency || (group?.currency || "USD"),
        category: category || "other",
        transactionType: transactionType || "expense",
        paymentMethod: paymentMethod || "cash",
        group: groupId || null,
        paidBy: paidByUserId,
        splitType,
        splits,
        receipt,
        date: date || new Date(),
        notes,
        tags: tags || [],
        createdBy: req.user._id,
      });

      await expense.save();

      // Update group total expenses if this is a group expense
      if (groupId && group) {
        await Group.findByIdAndUpdate(groupId, {
          $inc: { totalExpenses: amount },
          $addToSet: { expenses: expense._id },
        });
      }

      await expense.populate([
        { path: "paidBy", select: "name email avatar" },
        { path: "splits.user", select: "name email avatar" },
        { path: "group", select: "name currency" },
      ]);

      // Notify group members about the new expense (best-effort)
      if (groupId && group) {
        try {
          const memberEmails = (group.members || [])
            .map((m) => m.user?.email)
            .filter(Boolean);
          if (memberEmails.length) {
            const subject = `New expense in ${group.name}: ${expense.title}`;
            const html = `<p>Hi,</p><p><strong>${
              expense.paidBy.name
            }</strong> added a new expense "${expense.title}" of <strong>${
              expense.amount
            } ${expense.currency}</strong> in group <strong>${
              group.name
            }</strong>.</p><p><a href="${
              process.env.CLIENT_URL || "http://localhost:5173"
            }/groups/${groupId}">View expense</a></p>`;
            sendMail({ to: memberEmails.join(","), subject, html }).then((r) => {
              if (!r.success) console.warn("Expense notification email failed:", r.error);
            });
          }
        } catch (e) {
          console.error("Failed to send expense notification emails:", e);
        }
      }

      res.status(201).json({
        success: true,
        message: "Expense created successfully",
        data: { expense },
      });
    } catch (error) {
      console.error("Create expense error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while creating expense",
      });
    }
  }
);

// Get expenses for a group
router.get("/group/:groupId", authenticate, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Verify user is member of group
    const group = await Group.findOne({
      _id: groupId,
      "members.user": req.user._id,
      isActive: true,
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found or you are not a member",
      });
    }

    const expenses = await Expense.find({ group: groupId })
      .populate("paidBy", "name email avatar")
      .populate("splits.user", "name email avatar")
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalExpenses = await Expense.countDocuments({ group: groupId });

    res.json({
      success: true,
      data: {
        expenses,
        totalPages: Math.ceil(totalExpenses / limit),
        currentPage: page,
        totalExpenses,
      },
    });
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching expenses",
    });
  }
});

// Get single expense
router.get("/:expenseId", authenticate, async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId)
      .populate("paidBy", "name email avatar")
      .populate("splits.user", "name email avatar")
      .populate("group", "name currency members");

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Check if user is member of the group
    const isGroupMember = expense.group.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isGroupMember) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this expense",
      });
    }

    res.json({
      success: true,
      data: { expense },
    });
  } catch (error) {
    console.error("Get expense error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching expense",
    });
  }
});

// Update expense
router.put(
  "/:expenseId",
  authenticate,
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Title must be between 1 and 200 characters"),
    body("amount")
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be greater than 0"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { expenseId } = req.params;
      const { title, description, amount, category, receipt, notes } = req.body;

      const expense = await Expense.findById(expenseId).populate("group");

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: "Expense not found",
        });
      }

      // Check if user is the creator or group admin
      if (expense.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only edit expenses you created",
        });
      }

      const updateData = {};
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (category) updateData.category = category;
      if (receipt !== undefined) updateData.receipt = receipt;
      if (notes !== undefined) updateData.notes = notes;

      // If amount is being changed, recalculate splits
      if (amount && amount !== expense.amount) {
        const oldAmount = expense.amount;
        updateData.amount = amount;

        if (expense.splitType === "equal") {
          const newSplitAmount = amount / expense.splits.length;
          updateData.splits = expense.splits.map((split) => ({
            ...split,
            amount: newSplitAmount,
          }));
        } else if (expense.splitType === "percentage") {
          updateData.splits = expense.splits.map((split) => ({
            ...split,
            amount: (amount * split.percentage) / 100,
          }));
        }

        // Update group total expenses
        await Group.findByIdAndUpdate(expense.group._id, {
          $inc: { totalExpenses: amount - oldAmount },
        });
      }

      const updatedExpense = await Expense.findByIdAndUpdate(
        expenseId,
        updateData,
        { new: true, runValidators: true }
      )
        .populate("paidBy", "name email avatar")
        .populate("splits.user", "name email avatar")
        .populate("group", "name currency");

      res.json({
        success: true,
        message: "Expense updated successfully",
        data: { expense: updatedExpense },
      });
    } catch (error) {
      console.error("Update expense error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating expense",
      });
    }
  }
);

// Delete expense
router.delete("/:expenseId", authenticate, async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId).populate("group");

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Check if user is the creator or group admin
    if (expense.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete expenses you created",
      });
    }

    await Expense.findByIdAndDelete(expenseId);

    // Update group total expenses (only if expense belongs to a group)
    if (expense.group) {
      await Group.findByIdAndUpdate(expense.group._id, {
        $inc: { totalExpenses: -expense.amount },
        $pull: { expenses: expenseId },
      });
    }

    res.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting expense",
    });
  }
});

// Mark split as paid
router.put(
  "/:expenseId/splits/:userId/paid",
  authenticate,
  async (req, res) => {
    try {
      const { expenseId, userId } = req.params;

      const expense = await Expense.findById(expenseId);

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: "Expense not found",
        });
      }

      // Only the person who paid or the person who owes can mark as paid
      if (
        expense.paidBy.toString() !== req.user._id.toString() &&
        userId !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to mark this split as paid",
        });
      }

      const split = expense.splits.find((s) => s.user.toString() === userId);
      if (!split) {
        return res.status(404).json({
          success: false,
          message: "Split not found",
        });
      }

      split.paid = true;

      // Check if all splits are paid
      const allPaid = expense.splits.every((s) => s.paid);
      if (allPaid) {
        expense.isSettled = true;
      }

      await expense.save();

      res.json({
        success: true,
        message: "Split marked as paid",
        data: { expense },
      });
    } catch (error) {
      console.error("Mark split paid error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while marking split as paid",
      });
    }
  }
);

// Get balance calculations for a group
router.get("/group/:groupId/balances", authenticate, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verify user is member of group
    const group = await Group.findOne({
      _id: groupId,
      "members.user": req.user._id,
      isActive: true,
    }).populate("members.user", "name email avatar");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found or you are not a member",
      });
    }

    // Get all expenses for the group
    const expenses = await Expense.find({ group: groupId });

    // Get all confirmed settlements for the group
    const settlements = await Settlement.find({
      group: groupId,
      status: "confirmed",
    }).populate("from to", "name email avatar");

    // Calculate balances
    const balances = {};

    // Initialize balances for all members
    group.members.forEach((member) => {
      balances[member.user._id.toString()] = {
        user: member.user,
        totalPaid: 0,
        totalOwes: 0,
        // amounts settled (confirmed settlements)
        settledSent: 0, // amount this user has sent as settlement
        settledReceived: 0, // amount this user has received as settlement
        netBalance: 0,
      };
    });

    // Calculate totals from expenses
    expenses.forEach((expense) => {
      const paidById = expense.paidBy.toString();
      if (balances[paidById]) {
        balances[paidById].totalPaid += expense.amount;
      }

      expense.splits.forEach((split) => {
        const userId = split.user.toString();
        if (balances[userId]) {
          balances[userId].totalOwes += split.amount;
        }
      });
    });

    // Aggregate confirmed settlements per user
    settlements.forEach((settlement) => {
      const fromId = settlement.from._id.toString();
      const toId = settlement.to._id.toString();
      const amt = settlement.amount || 0;

      if (balances[fromId]) {
        balances[fromId].settledSent += amt;
      }
      if (balances[toId]) {
        balances[toId].settledReceived += amt;
      }
    });

    // Compute display values: remaining owes/paid after settlements
    Object.keys(balances).forEach((userId) => {
      const b = balances[userId];
      // Remaining owes = totalOwes - amount the user already paid via settlements
      b.remainingOwes = Math.max(0, +(b.totalOwes - b.settledSent).toFixed(2));
      // Remaining paid (credit) = totalPaid - amount received via settlements (others paid them)
      b.remainingPaid = Math.max(
        0,
        +(b.totalPaid - b.settledReceived).toFixed(2)
      );

      // Net balance based on remaining values
      b.netBalance = +(b.remainingPaid - b.remainingOwes).toFixed(2);
    });

    // Generate simplified settlements from net balances
    const suggestedSettlements = [];
    const balanceArray = Object.values(balances).map((b) => ({ ...b }));
    const creditors = balanceArray
      .filter((b) => b.netBalance > 0.01)
      .sort((a, b) => b.netBalance - a.netBalance);
    const debtors = balanceArray
      .filter((b) => b.netBalance < -0.01)
      .sort((a, b) => a.netBalance - b.netBalance);

    let cIndex = 0;
    let dIndex = 0;
    while (cIndex < creditors.length && dIndex < debtors.length) {
      const creditor = creditors[cIndex];
      const debtor = debtors[dIndex];
      const amount = Math.min(creditor.netBalance, Math.abs(debtor.netBalance));

      if (amount > 0.01) {
        suggestedSettlements.push({
          from: debtor.user,
          to: creditor.user,
          amount: +amount.toFixed(2),
        });

        creditor.netBalance = +(creditor.netBalance - amount).toFixed(2);
        debtor.netBalance = +(debtor.netBalance + amount).toFixed(2);
      }

      if (creditor.netBalance <= 0.01) cIndex++;
      if (Math.abs(debtor.netBalance) <= 0.01) dIndex++;
    }

    res.json({
      success: true,
      data: {
        balances: Object.values(balances).map((b) => ({
          user: b.user,
          totalPaid: +b.totalPaid.toFixed(2),
          totalOwes: +b.totalOwes.toFixed(2),
          settledSent: +b.settledSent.toFixed(2),
          settledReceived: +b.settledReceived.toFixed(2),
          remainingPaid: b.remainingPaid,
          remainingOwes: b.remainingOwes,
          netBalance: b.netBalance,
        })),
        settlements: suggestedSettlements,
      },
    });
  } catch (error) {
    console.error("Get balances error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while calculating balances",
    });
  }
});

export default router;
