const ChatMessage = require('../models/ChatMessage');
const Case = require('../models/Case');
const Lawyer = require('../models/Lawyer');
const { AppError } = require('../middleware/errorHandler');
const { getPagination } = require('../utils/helpers');
const { TIMELINE_EVENTS } = require('../utils/constants');
const { getIO } = require('../config/socket');
const { uploadToCloudinary } = require('../config/cloudinary');
const { cleanupTempFile } = require('../middleware/upload');

// @desc    Send a message in a case chat
// @route   POST /api/chat/:caseId/messages
// @access  Private (Case owner or assigned lawyer)
const sendMessage = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { message, messageType } = req.body;

    // Verify case exists
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return next(new AppError('Case not found', 404));
    }

    // Authorization — only case owner or assigned lawyer
    const isOwner = caseDoc.userId._id.toString() === req.user.id;
    let isAssignedLawyer = false;

    if (req.user.role === 'lawyer') {
      const lawyer = await Lawyer.findOne({ userId: req.user.id });
      if (lawyer && caseDoc.lawyerId) {
        isAssignedLawyer = caseDoc.lawyerId._id.toString() === lawyer._id.toString();
      }
    }

    if (!isOwner && !isAssignedLawyer) {
      return next(new AppError('You are not authorized to chat in this case', 403));
    }

    // Handle file attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.path, `jurisbridge/chat/${caseId}`);
        attachments.push({
          url: uploaded.url,
          publicId: uploaded.publicId,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
        });
        cleanupTempFile(file.path);
      }
    }

    // Create message
    const chatMessage = await ChatMessage.create({
      caseId,
      senderId: req.user.id,
      senderRole: req.user.role,
      message: message || '',
      attachments,
      messageType: attachments.length > 0 ? 'file' : (messageType || 'text'),
    });

    // Populate sender info
    await chatMessage.populate('senderId', 'name avatar role');

    // Emit via Socket.io for real-time delivery
    try {
      const io = getIO();
      io.to(`case_${caseId}`).emit('receive_message', chatMessage);
    } catch (socketErr) {
      console.log('⚠️ Socket emit skipped:', socketErr.message);
    }

    // Update case timeline (only for first message or every 10th)
    const messageCount = await ChatMessage.countDocuments({ caseId });
    if (messageCount === 1) {
      await caseDoc.addTimelineEntry(
        TIMELINE_EVENTS.MESSAGE_SENT,
        `Chat started between ${req.user.name} and the other party`,
        req.user.id
      );
    }

    res.status(201).json({
      success: true,
      data: chatMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a case
// @route   GET /api/chat/:caseId/messages
// @access  Private (Case owner or assigned lawyer)
const getMessages = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit || 50);

    // Verify case exists and user is authorized
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return next(new AppError('Case not found', 404));
    }

    const isOwner = caseDoc.userId._id.toString() === req.user.id;
    let isAssignedLawyer = false;

    if (req.user.role === 'lawyer') {
      const lawyer = await Lawyer.findOne({ userId: req.user.id });
      if (lawyer && caseDoc.lawyerId) {
        isAssignedLawyer = caseDoc.lawyerId._id.toString() === lawyer._id.toString();
      }
    }

    if (!isOwner && !isAssignedLawyer) {
      return next(new AppError('You are not authorized to view this chat', 403));
    }

    const total = await ChatMessage.countDocuments({ caseId });
    const messages = await ChatMessage.find({ caseId })
      .populate('senderId', 'name avatar role')
      .sort({ createdAt: 1 }) // Oldest first (chat order)
      .skip(skip)
      .limit(limit);

    // Mark messages as read
    await ChatMessage.updateMany(
      {
        caseId,
        senderId: { $ne: req.user.id },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread message count
// @route   GET /api/chat/unread
// @access  Private
const getUnreadCount = async (req, res, next) => {
  try {
    // Find all cases the user is part of
    let caseFilter = {};

    if (req.user.role === 'user') {
      caseFilter = { userId: req.user.id };
    } else if (req.user.role === 'lawyer') {
      const lawyer = await Lawyer.findOne({ userId: req.user.id });
      if (lawyer) {
        caseFilter = { lawyerId: lawyer._id };
      }
    }

    const userCases = await Case.find(caseFilter).select('_id');
    const caseIds = userCases.map((c) => c._id);

    const unreadCount = await ChatMessage.countDocuments({
      caseId: { $in: caseIds },
      senderId: { $ne: req.user.id },
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getUnreadCount,
};