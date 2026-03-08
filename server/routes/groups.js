import express from 'express';
import { body, validationResult } from 'express-validator';
import Group from '../models/Group.js';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import { authenticate } from '../middleware/auth.js';
import { sendMail } from '../utils/mailer.js';

const router = express.Router();

// Create new group
router.post('/', authenticate, [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Group name must be between 2 and 100 characters'),
  body('category')
    .optional()
    .isIn(['trip', 'home', 'couple', 'other'])
    .withMessage('Invalid category'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'])
    .withMessage('Invalid currency')
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

    const { name, description, category, currency, image, members } = req.body;

    // Start with current user as admin
    const groupMembers = [{
      user: req.user._id,
      role: 'admin'
    }];

    // Add selected members as regular members
    if (members && Array.isArray(members)) {
      for (const memberId of members) {
        // Verify each member exists and is not already added
        const user = await User.findById(memberId);
        if (user && memberId !== req.user._id.toString()) {
          groupMembers.push({
            user: memberId,
            role: 'member'
          });
        }
      }
    }

    const group = new Group({
      name,
      description,
      category: category || 'other',
      currency: currency || req.user.currency || 'INR',
      image,
      createdBy: req.user._id,
      members: groupMembers
    });

    await group.save();

    // Add group to all members' groups
    const allMemberIds = groupMembers.map(m => m.user);
    await User.updateMany(
      { _id: { $in: allMemberIds } },
      { $addToSet: { groups: group._id } }
    );

    await group.populate('members.user', 'name email avatar');
    await group.populate('createdBy', 'name email avatar');

    // Send notification emails to members (best-effort, non-blocking)
    try {
      const emails = group.members.map(m => m.user?.email).filter(Boolean);
      if (emails.length) {
        const subject = `You've been added to group \"${group.name}\"`;
        const html = `<p>Hi,</p><p>You were added to the group <strong>${group.name}</strong> by ${req.user.name}.</p><p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/groups/${group._id}">View group</a></p>`;
        sendMail({ to: emails.join(','), subject, html }).then(r => {
          if (!r.success) console.warn('Group notification email failed:', r.error);
        });
      }
    } catch (e) {
      console.error('Failed to send group notification emails:', e);
    }

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: { group }
    });

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating group'
    });
  }
});

// Get user's groups
router.get('/', authenticate, async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.user._id,
      isActive: true
    })
    .populate('members.user', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: { groups }
    });

  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching groups'
    });
  }
});

// Get single group details
router.get('/:groupId', authenticate, async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findOne({
      _id: groupId,
      'members.user': req.user._id,
      isActive: true
    })
    .populate('members.user', 'name email avatar totalBalance')
    .populate('createdBy', 'name email avatar')
    .populate({
      path: 'expenses',
      populate: [
        { path: 'paidBy', select: 'name email avatar' },
        { path: 'splits.user', select: 'name email avatar' }
      ]
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or you are not a member'
      });
    }

    res.json({
      success: true,
      data: { group }
    });

  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching group'
    });
  }
});

// Add member to group
router.post('/:groupId/members', authenticate, [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
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

    const { groupId } = req.params;
    const { userId } = req.body;

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

    // Check if user is admin
    const currentUserMember = group.members.find(
      member => member.user.toString() === req.user._id.toString()
    );
    
    if (currentUserMember.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can add members'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const isAlreadyMember = group.members.some(
      member => member.user.toString() === userId
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this group'
      });
    }

    // Add member to group
    group.members.push({
      user: userId,
      role: 'member'
    });

    await group.save();

    // Add group to user's groups
    await User.findByIdAndUpdate(userId, {
      $addToSet: { groups: groupId }
    });

    await group.populate('members.user', 'name email avatar');

    // Notify existing members and the new member
    try {
      const memberEmails = group.members.map(m => m.user?.email).filter(Boolean);
      const addedEmail = user.email;
      const subject = `${req.user.name} added ${user.name} to group ${group.name}`;
      const html = `<p>Hi,</p><p>${req.user.name} added <strong>${user.name}</strong> to the group <strong>${group.name}</strong>.</p><p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/groups/${group._id}">View group</a></p>`;
      if (memberEmails.length) {
        sendMail({ to: memberEmails.join(','), subject, html }).then(r => {
          if (!r.success) console.warn('Member add email failed:', r.error);
        });
      }
      // Also send to the newly added user if they have email
      if (addedEmail) {
        sendMail({ to: addedEmail, subject: `You've been added to ${group.name}`, html }).then(r => {
          if (!r.success) console.warn('New member email failed:', r.error);
        });
      }
    } catch (e) {
      console.error('Failed to send member add emails:', e);
    }

    res.json({
      success: true,
      message: 'Member added successfully',
      data: { group }
    });

  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding member'
    });
  }
});

// Leave group
router.delete('/:groupId/leave', authenticate, async (req, res) => {
  try {
    const { groupId } = req.params;

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

    // Check if user has unsettled expenses
    const unsettledExpenses = await Expense.find({
      group: groupId,
      $or: [
        { paidBy: req.user._id },
        { 'splits.user': req.user._id, 'splits.paid': false }
      ],
      isSettled: false
    });

    if (unsettledExpenses.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot leave group with unsettled expenses'
      });
    }

    // Remove user from group
    group.members = group.members.filter(
      member => member.user.toString() !== req.user._id.toString()
    );

    // If no members left, mark group as inactive
    if (group.members.length === 0) {
      group.isActive = false;
    }

    await group.save();

    // Remove group from user's groups
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { groups: groupId }
    });

    res.json({
      success: true,
      message: 'Left group successfully'
    });

  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while leaving group'
    });
  }
});

// Delete group (admin only)
router.delete('/:groupId', authenticate, async (req, res) => {
  try {
    const { groupId } = req.params;

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

    // Check if user is admin
    const currentUserMember = group.members.find(
      member => member.user.toString() === req.user._id.toString()
    );

    if (currentUserMember.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete groups'
      });
    }

    // Check if group has any expenses
    const hasExpenses = await Expense.findOne({
      group: groupId,
      isActive: true
    });

    if (hasExpenses) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete group with existing expenses. Please settle all expenses first.'
      });
    }

    // Mark group as inactive instead of deleting
    await Group.findByIdAndUpdate(groupId, { isActive: false });

    // Remove group from all members' groups list
    const memberIds = group.members.map(m => m.user);
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $pull: { groups: groupId } }
    );

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });

  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting group'
    });
  }
});

// Update group
router.put('/:groupId', authenticate, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Group name must be between 2 and 100 characters'),
  body('category')
    .optional()
    .isIn(['trip', 'home', 'couple', 'other'])
    .withMessage('Invalid category')
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

    const { groupId } = req.params;
    const { name, description, category, image } = req.body;

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

    // Check if user is admin
    const currentUserMember = group.members.find(
      member => member.user.toString() === req.user._id.toString()
    );
    
    if (currentUserMember.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update group details'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (image !== undefined) updateData.image = image;

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('members.user', 'name email avatar')
    .populate('createdBy', 'name email avatar');

    res.json({
      success: true,
      message: 'Group updated successfully',
      data: { group: updatedGroup }
    });

  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating group'
    });
  }
});

export default router;
