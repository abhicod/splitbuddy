import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import Settlement from '../models/Settlement.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all users (for search/add friends)
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { name: { $regex: q.trim(), $options: 'i' } },
            { email: { $regex: q.trim(), $options: 'i' } }
          ]
        }
      ]
    })
    .select('name email avatar')
    .limit(20);

    res.json({
      success: true,
      data: { users }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user search'
    });
  }
});

// Add friend
router.post('/friends/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add yourself as a friend'
      });
    }

    const friend = await User.findById(userId);
    if (!friend) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already friends
    if (req.user.friends.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already your friend'
      });
    }

    // Add to both users' friend lists
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { friends: userId }
    });
    
    await User.findByIdAndUpdate(userId, {
      $addToSet: { friends: req.user._id }
    });

    res.json({
      success: true,
      message: 'Friend added successfully',
      data: { friend: { _id: friend._id, name: friend.name, email: friend.email, avatar: friend.avatar } }
    });

  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding friend'
    });
  }
});

// Remove friend
router.delete('/friends/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Remove from both users' friend lists
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { friends: userId }
    });
    
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: req.user._id }
    });

    res.json({
      success: true,
      message: 'Friend removed successfully'
    });

  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing friend'
    });
  }
});

// Get user's friends
router.get('/friends', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'name email avatar totalBalance');

    res.json({
      success: true,
      data: { friends: user.friends }
    });

  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching friends'
    });
  }
});

// Get user's balance summary
router.get('/balance', authenticate, async (req, res) => {
  try {
    // Calculate user's overall balance across all groups they are a member of
    // Fetch groups where the user is a member
    const groups = await Group.find({ 'members.user': req.user._id, isActive: true }).select('_id');
    const groupIds = groups.map(g => g._id);

    // If user is not in any groups, return zero balance using their preferred currency
    const user = await User.findById(req.user._id).select('currency');
    if (!groupIds.length) {
      return res.json({
        success: true,
        data: { totalBalance: 0, currency: user?.currency || 'USD' }
      });
    }

    // Fetch all expenses for these groups
    const expenses = await Expense.find({ group: { $in: groupIds } });

    // Fetch all confirmed settlements for these groups
    const settlements = await Settlement.find({ group: { $in: groupIds }, status: 'confirmed' });

    // Aggregate totals for the user
    let totalPaid = 0;
    let totalOwes = 0;
    let settledSent = 0;
    let settledReceived = 0;

    // Calculate from expenses
    expenses.forEach(expense => {
      if (expense.paidBy && expense.paidBy.toString() === req.user._id.toString()) {
        totalPaid += expense.amount || 0;
      }

      (expense.splits || []).forEach(split => {
        const userId = (split.user && split.user.toString) ? split.user.toString() : String(split.user);
        if (userId === req.user._id.toString()) {
          totalOwes += split.amount || 0;
        }
      });
    });

    // Calculate from confirmed settlements
    settlements.forEach(settlement => {
      const fromId = settlement.from?.toString ? settlement.from.toString() : String(settlement.from);
      const toId = settlement.to?.toString ? settlement.to.toString() : String(settlement.to);
      const amt = settlement.amount || 0;

      if (fromId === req.user._id.toString()) settledSent += amt;
      if (toId === req.user._id.toString()) settledReceived += amt;
    });

    // Remaining values after settlements
    const remainingPaid = Math.max(0, +(totalPaid - settledReceived).toFixed(2));
    const remainingOwes = Math.max(0, +(totalOwes - settledSent).toFixed(2));
    const totalBalance = +(remainingPaid - remainingOwes).toFixed(2);

    res.json({
      success: true,
      data: {
        totalBalance,
        currency: user?.currency || 'USD'
      }
    });

  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching balance'
    });
  }
});

// Get user's dashboard data
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'groups',
        select: 'name description category totalExpenses members',
        match: { isActive: true },
        populate: {
          path: 'members.user',
          select: 'name email avatar'
        }
      });

    // Get recent expenses from user's groups
    const groupIds = user.groups.map(group => group._id);
    
    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          totalBalance: user.totalBalance,
          currency: user.currency
        },
        groups: user.groups,
        totalGroups: user.groups.length,
        totalFriends: user.friends.length
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

export default router;
