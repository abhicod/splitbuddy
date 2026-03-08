import express from 'express';
import { body, validationResult } from 'express-validator';
import Settlement from '../models/Settlement.js';
import Group from '../models/Group.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { sendMail } from '../utils/mailer.js';

const router = express.Router();

// Create new settlement record
router.post('/', authenticate, [
  body('groupId')
    .notEmpty()
    .withMessage('Group ID is required'),
  body('fromUserId')
    .notEmpty()
    .withMessage('From user ID is required'),
  body('toUserId')
    .notEmpty()
    .withMessage('To user ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('method')
    .optional()
    .isIn(['cash', 'bank_transfer', 'paypal', 'venmo', 'other'])
    .withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { groupId, fromUserId, toUserId, amount, method, notes, currency } = req.body;

    // Verify group exists and user is member
    const group = await Group.findOne({
      _id: groupId,
      'members.user': req.user._id,
      isActive: true
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or you are not a member'
      });
    }

    // Verify both users are group members
    const fromUserMember = group.members.some(m => m.user.toString() === fromUserId);
    const toUserMember = group.members.some(m => m.user.toString() === toUserId);

    if (!fromUserMember || !toUserMember) {
      return res.status(400).json({
        success: false,
        message: 'Both users must be members of the group'
      });
    }

    // Only the person paying or receiving can record the settlement
    if (req.user._id.toString() !== fromUserId && req.user._id.toString() !== toUserId) {
      return res.status(403).json({
        success: false,
        message: 'You can only record settlements you are involved in'
      });
    }

    // Create settlement record
    const settlement = new Settlement({
      group: groupId,
      from: fromUserId,
      to: toUserId,
      amount,
      currency: currency || group.currency,
      method: method || 'cash',
      notes,
      status: 'pending', // Will be confirmed when other party acknowledges
      settledAt: new Date()
    });

    await settlement.save();

    await settlement.populate([
      { path: 'from', select: 'name email avatar' },
      { path: 'to', select: 'name email avatar' },
      { path: 'group', select: 'name currency' }
    ]);

    // Notify involved users and group members
    try {
      const groupMembers = group.members.map(m => m.user.toString());
      const memberDocs = await User.find({ _id: { $in: groupMembers } }).select('email name');
      const memberEmails = memberDocs.map(m => m.email).filter(Boolean);

      const subject = `Payment recorded in ${group.name}`;
      const html = `<p>Hi,</p><p><strong>${settlement.from.name}</strong> paid <strong>${settlement.to.name}</strong> <strong>${settlement.amount} ${settlement.currency}</strong> in group <strong>${group.name}</strong>.</p><p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/groups/${group._id}">View group</a></p>`;

      if (memberEmails.length) {
        sendMail({ to: memberEmails.join(','), subject, html }).then(r => {
          if (!r.success) console.warn('Settlement email failed:', r.error);
        });
      }
    } catch (e) {
      console.error('Failed to send settlement emails:', e);
    }

    res.status(201).json({
      success: true,
      message: 'Settlement recorded successfully',
      data: { settlement }
    });

  } catch (error) {
    console.error('Create settlement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording settlement'
    });
  }
});

// Confirm settlement (by the receiving party)
router.put('/:settlementId/confirm', authenticate, async (req, res) => {
  try {
    const { settlementId } = req.params;

    const settlement = await Settlement.findById(settlementId)
      .populate('from', 'name email')
      .populate('to', 'name email')
      .populate('group', 'name');

    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: 'Settlement not found'
      });
    }

    // Verify user is the recipient and settlement is pending
    if (settlement.to._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient can confirm this settlement'
      });
    }

    if (settlement.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Settlement has already been processed'
      });
    }

    settlement.status = 'confirmed';
    settlement.confirmedBy = req.user._id;
    await settlement.save();

    // Notify involved users
    try {
      const subject = `Payment confirmed in ${settlement.group.name}`;
      const html = `<p>Hi,</p><p>The payment of <strong>${settlement.amount} ${settlement.currency}</strong> from <strong>${settlement.from.name}</strong> to <strong>${settlement.to.name}</strong> in group <strong>${settlement.group.name}</strong> has been confirmed.</p><p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/groups/${settlement.group._id}">View group</a></p>`;
      const emails = [settlement.from.email, settlement.to.email].filter(Boolean);
      if (emails.length) {
        sendMail({ to: emails.join(','), subject, html }).then(r => {
          if (!r.success) console.warn('Settlement confirm email failed:', r.error);
        });
      }
    } catch (e) {
      console.error('Failed to send settlement confirm emails:', e);
    }

    res.json({
      success: true,
      message: 'Settlement confirmed successfully',
      data: { settlement }
    });

  } catch (error) {
    console.error('Confirm settlement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while confirming settlement'
    });
  }
});

// Get settlements for a group
router.get('/group/:groupId', authenticate, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { status } = req.query;

    // Verify user is member of group
    const group = await Group.findOne({
      _id: groupId,
      'members.user': req.user._id,
      isActive: true
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or you are not a member'
      });
    }

    const query = { group: groupId };
    if (status) {
      query.status = status;
    }

    const settlements = await Settlement.find(query)
      .populate('from', 'name email avatar')
      .populate('to', 'name email avatar')
      .populate('confirmedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { settlements }
    });

  } catch (error) {
    console.error('Get settlements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching settlements'
    });
  }
});

// Delete/cancel settlement
router.delete('/:settlementId', authenticate, async (req, res) => {
  try {
    const { settlementId } = req.params;

    const settlement = await Settlement.findById(settlementId);

    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: 'Settlement not found'
      });
    }

    // Only the person who created the settlement can delete it
    if (settlement.from.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel settlements you created'
      });
    }

    // Can only cancel pending settlements
    if (settlement.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a confirmed settlement'
      });
    }

    await Settlement.findByIdAndDelete(settlementId);

    res.json({
      success: true,
      message: 'Settlement cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel settlement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling settlement'
    });
  }
});

export default router;
