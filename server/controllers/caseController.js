const Case = require('../models/Case');
const Lawyer = require('../models/Lawyer');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const { getPagination, truncateText } = require('../utils/helpers');
const { CASE_STATUS, TIMELINE_EVENTS } = require('../utils/constants');
const { notifyLawyerNewCase, notifyUserCaseAccepted, smsNotifyLawyerNewCase } = require('../services/notificationService');

// @desc    Create a new case
// @route   POST /api/cases
// @access  Private (User only)
// @desc    Create a new case
// @route   POST /api/cases
// @access  Private (User only)
const createCase = async (req, res, next) => {
  try {
    const { title, description, category, priority, lawyerId, aiQueryId } = req.body;

    // Create the case
    const caseData = {
      userId: req.user.id,
      title,
      description,
      category,
      priority: priority || 'normal',
      status: CASE_STATUS.PENDING,
      timeline: [
        {
          event: TIMELINE_EVENTS.CASE_CREATED,
          description: `Case "${title}" was created by ${req.user.name}`,
          performedBy: req.user.id,
        },
      ],
    };

    // If created from AI escalation
    if (aiQueryId) {
      caseData.aiQueryId = aiQueryId;
      caseData.escalatedFromAI = true;
    }

    // If user selected a specific lawyer
    if (lawyerId) {
      const lawyer = await Lawyer.findById(lawyerId).populate('userId', 'name email phone');
      if (!lawyer) {
        return next(new AppError('Selected lawyer not found', 404));
      }
      caseData.lawyerId = lawyerId;
      caseData.timeline.push({
        event: TIMELINE_EVENTS.LAWYER_NOTIFIED,
        description: `Lawyer ${lawyer.userId.name} has been notified about this case`,
        performedBy: req.user.id,
      });

      // Notify the lawyer via email
      await notifyLawyerNewCase(
        lawyer.userId.email,
        lawyer.userId.name,
        { category, title, priority: priority || 'normal' }
      );

      // Notify via SMS if phone available
      if (lawyer.userId.phone) {
        await smsNotifyLawyerNewCase(lawyer.userId.phone, lawyer.userId.name, category);
      }
    }

    // ======== AUTO-ASSIGN BEST LAWYER IF NONE SELECTED ========
    if (!lawyerId) {
      const bestLawyer = await findBestLawyerForCategory(category);
      if (bestLawyer) {
        caseData.lawyerId = bestLawyer._id;
        caseData.timeline.push({
          event: TIMELINE_EVENTS.LAWYER_NOTIFIED,
          description: `Auto-matched with ${bestLawyer.userId.name} based on specialization, rating, and experience`,
          performedBy: req.user.id,
        });

        // Notify the auto-matched lawyer
        try {
          await notifyLawyerNewCase(
            bestLawyer.userId.email,
            bestLawyer.userId.name,
            { category, title, priority: priority || 'normal' }
          );

          if (bestLawyer.userId.phone) {
            await smsNotifyLawyerNewCase(bestLawyer.userId.phone, bestLawyer.userId.name, category);
          }
        } catch (notifyErr) {
          console.error('⚠️ Failed to notify auto-matched lawyer:', notifyErr.message);
        }

        console.log(`🤖 Auto-assigned case "${title}" to ${bestLawyer.userId.name} (Rating: ${bestLawyer.rating}, Exp: ${bestLawyer.experience}yrs)`);
      } else {
        // No matching lawyer found — still notify all matching lawyers
        console.log(`⚠️ No matching lawyer found for category: ${category}. Case created without assignment.`);
      }
    }

    const newCase = await Case.create(caseData);

    // Populate the lawyer info in response so frontend can show it
    const populatedCase = await Case.findById(newCase._id)
      .populate({
        path: 'lawyerId',
        populate: { path: 'userId', select: 'name email phone avatar' },
      });

    // If still no lawyer assigned, notify matching lawyers
    if (!populatedCase.lawyerId) {
      await notifyMatchingLawyers(newCase);
    }

    res.status(201).json({
      success: true,
      message: populatedCase.lawyerId
        ? `📂 Case created and sent to ${populatedCase.lawyerId.userId.name}!`
        : '📂 Case created! Matching lawyers will be notified.',
      data: populatedCase,
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Get all cases for current user
// @route   GET /api/cases
// @access  Private
const getMyCases = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { status, category } = req.query;

    // Build filter based on role
    const filter = {};

    if (req.user.role === 'user') {
      filter.userId = req.user.id;
    } else if (req.user.role === 'lawyer') {
      // Get the lawyer's profile
      const lawyer = await Lawyer.findOne({ userId: req.user.id });
      if (!lawyer) {
        return next(new AppError('Lawyer profile not found', 404));
      }
      filter.lawyerId = lawyer._id;
    }

    if (status) filter.status = status;
    if (category) filter.category = category;

    const total = await Case.countDocuments(filter);
    const cases = await Case.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-timeline');

    res.status(200).json({
      success: true,
      count: cases.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: cases,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single case by ID
// @route   GET /api/cases/:id
// @access  Private (Owner or Assigned Lawyer)
const getCaseById = async (req, res, next) => {
  try {
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return next(new AppError('Case not found', 404));
    }

    // Authorization check
    const isOwner = caseDoc.userId._id.toString() === req.user.id;
    let isAssignedLawyer = false;

    if (req.user.role === 'lawyer') {
      const lawyer = await Lawyer.findOne({ userId: req.user.id });
      if (lawyer && caseDoc.lawyerId) {
        isAssignedLawyer = caseDoc.lawyerId._id.toString() === lawyer._id.toString();
      }
    }

    if (!isOwner && !isAssignedLawyer) {
      return next(new AppError('You are not authorized to view this case', 403));
    }

    res.status(200).json({
      success: true,
      data: caseDoc,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update case details
// @route   PUT /api/cases/:id
// @access  Private (Owner only)
const updateCase = async (req, res, next) => {
  try {
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return next(new AppError('Case not found', 404));
    }

    // Only case owner can update
    if (caseDoc.userId._id.toString() !== req.user.id) {
      return next(new AppError('Only the case owner can update this case', 403));
    }

    // Cannot update resolved/closed cases
    if ([CASE_STATUS.RESOLVED, CASE_STATUS.CLOSED].includes(caseDoc.status)) {
      return next(new AppError('Cannot update a resolved or closed case', 400));
    }

    const allowedFields = ['title', 'description', 'category', 'priority'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      {
        ...updates,
        $push: {
          timeline: {
            event: TIMELINE_EVENTS.STATUS_CHANGED,
            description: `Case details were updated by ${req.user.name}`,
            performedBy: req.user.id,
          },
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Case updated successfully',
      data: updatedCase,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending cases for lawyers (unassigned or assigned to them)
// @route   GET /api/cases/lawyer/requests
// @access  Private (Lawyer only)
const getLawyerRequests = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

    const lawyer = await Lawyer.findOne({ userId: req.user.id });
    if (!lawyer) {
      return next(new AppError('Lawyer profile not found', 404));
    }

    // Find cases assigned to this lawyer that are pending
    // OR unassigned cases matching their specialization
    const filter = {
      $or: [
        { lawyerId: lawyer._id, status: CASE_STATUS.PENDING },
        {
          lawyerId: null,
          status: CASE_STATUS.PENDING,
          category: {
            $in: getCategoryMatchForSpecializations(lawyer.specializations),
          },
        },
      ],
    };

    const total = await Case.countDocuments(filter);
    const cases = await Case.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: cases.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: cases,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept a case (Lawyer)
// @route   PUT /api/cases/:id/accept
// @access  Private (Lawyer only)
const acceptCase = async (req, res, next) => {
  try {
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return next(new AppError('Case not found', 404));
    }

    if (caseDoc.status !== CASE_STATUS.PENDING) {
      return next(new AppError('This case is no longer pending', 400));
    }

    const lawyer = await Lawyer.findOne({ userId: req.user.id });
    if (!lawyer) {
      return next(new AppError('Lawyer profile not found', 404));
    }

    // If case is assigned to another lawyer
    if (caseDoc.lawyerId && caseDoc.lawyerId._id.toString() !== lawyer._id.toString()) {
      return next(new AppError('This case is assigned to another lawyer', 403));
    }

    // Accept the case
    caseDoc.lawyerId = lawyer._id;
    caseDoc.status = CASE_STATUS.ACTIVE;
    caseDoc.timeline.push({
      event: TIMELINE_EVENTS.LAWYER_ASSIGNED,
      description: `Lawyer ${req.user.name} accepted and is now handling this case`,
      performedBy: req.user.id,
    });

    await caseDoc.save();

    // Update lawyer's total cases count
    await Lawyer.findByIdAndUpdate(lawyer._id, {
      $inc: { totalCases: 1 },
    });

    // Notify the user that their case was accepted
    const caseUser = await User.findById(caseDoc.userId._id);
    if (caseUser) {
      await notifyUserCaseAccepted(
        caseUser.email,
        caseUser.name,
        req.user.name,
        caseDoc.title
      );
    }

    res.status(200).json({
      success: true,
      message: `✅ Case accepted! You are now assigned to "${caseDoc.title}"`,
      data: caseDoc,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject/Decline a case (Lawyer)
// @route   PUT /api/cases/:id/reject
// @access  Private (Lawyer only)
const rejectCase = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return next(new AppError('Case not found', 404));
    }

    const lawyer = await Lawyer.findOne({ userId: req.user.id });
    if (!lawyer) {
      return next(new AppError('Lawyer profile not found', 404));
    }

    // Remove lawyer assignment, set back to pending
    caseDoc.lawyerId = null;
    caseDoc.status = CASE_STATUS.PENDING;
    caseDoc.timeline.push({
      event: TIMELINE_EVENTS.STATUS_CHANGED,
      description: `Lawyer ${req.user.name} declined this case. Reason: ${reason || 'Not specified'}`,
      performedBy: req.user.id,
      metadata: { reason },
    });

    await caseDoc.save();

    // Try to notify other matching lawyers
    await notifyMatchingLawyers(caseDoc);

    res.status(200).json({
      success: true,
      message: 'Case declined. Other matching lawyers will be notified.',
      data: caseDoc,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve a case (Lawyer)
// @route   PUT /api/cases/:id/resolve
// @access  Private (Lawyer only)
const resolveCase = async (req, res, next) => {
  try {
    const { resolution } = req.body;
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return next(new AppError('Case not found', 404));
    }

    if (caseDoc.status !== CASE_STATUS.ACTIVE && caseDoc.status !== CASE_STATUS.IN_PROGRESS) {
      return next(new AppError('Only active cases can be resolved', 400));
    }

    const lawyer = await Lawyer.findOne({ userId: req.user.id });
    if (!lawyer || caseDoc.lawyerId._id.toString() !== lawyer._id.toString()) {
      return next(new AppError('Only the assigned lawyer can resolve this case', 403));
    }

    caseDoc.status = CASE_STATUS.RESOLVED;
    caseDoc.resolution = resolution || '';
    caseDoc.resolvedAt = new Date();
    caseDoc.timeline.push({
      event: TIMELINE_EVENTS.CASE_RESOLVED,
      description: `Case resolved by Lawyer ${req.user.name}`,
      performedBy: req.user.id,
      metadata: { resolution },
    });

    await caseDoc.save();

    res.status(200).json({
      success: true,
      message: '🎉 Case has been resolved!',
      data: caseDoc,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close a case (User — after resolution)
// @route   PUT /api/cases/:id/close
// @access  Private (User only)
const closeCase = async (req, res, next) => {
  try {
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return next(new AppError('Case not found', 404));
    }

    if (caseDoc.userId._id.toString() !== req.user.id) {
      return next(new AppError('Only the case owner can close this case', 403));
    }

    caseDoc.status = CASE_STATUS.CLOSED;
    caseDoc.closedAt = new Date();
    caseDoc.timeline.push({
      event: TIMELINE_EVENTS.CASE_CLOSED,
      description: `Case closed by ${req.user.name}`,
      performedBy: req.user.id,
    });

    await caseDoc.save();

    res.status(200).json({
      success: true,
      message: 'Case has been closed.',
      data: caseDoc,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add lawyer notes to a case
// @route   PUT /api/cases/:id/notes
// @access  Private (Assigned Lawyer only)
const addLawyerNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const caseDoc = await Case.findById(req.params.id);

    if (!caseDoc) {
      return next(new AppError('Case not found', 404));
    }

    const lawyer = await Lawyer.findOne({ userId: req.user.id });
    if (!lawyer || !caseDoc.lawyerId || caseDoc.lawyerId._id.toString() !== lawyer._id.toString()) {
      return next(new AppError('Only the assigned lawyer can add notes', 403));
    }

    caseDoc.lawyerNotes = notes;
    caseDoc.timeline.push({
      event: TIMELINE_EVENTS.STATUS_CHANGED,
      description: 'Lawyer added case notes',
      performedBy: req.user.id,
    });

    await caseDoc.save();

    res.status(200).json({
      success: true,
      message: 'Notes added to case',
      data: caseDoc,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get case stats for dashboard
// @route   GET /api/cases/stats
// @access  Private
const getCaseStats = async (req, res, next) => {
  try {
    let matchFilter = {};

    if (req.user.role === 'user') {
      matchFilter = { userId: req.user._id };
    } else if (req.user.role === 'lawyer') {
      const lawyer = await Lawyer.findOne({ userId: req.user.id });
      if (lawyer) {
        matchFilter = { lawyerId: lawyer._id };
      }
    }

    const stats = await Case.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryStats = await Case.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Format stats
    const statusCounts = {
      pending: 0,
      active: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };

    stats.forEach((s) => {
      statusCounts[s._id] = s.count;
    });

    const totalCases = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    res.status(200).json({
      success: true,
      data: {
        totalCases,
        statusBreakdown: statusCounts,
        categoryBreakdown: categoryStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// HELPERS
// ========================

// Map categories to specializations for matching
const getCategoryMatchForSpecializations = (specializations) => {
  const map = {
    'Criminal Law': ['Criminal Case'],
    'Family Law': ['Family Matter'],
    'Corporate Law': ['Business Contract'],
    'Civil Litigation': ['Property Dispute', 'Civil Rights'],
    'Cyber Law': ['Cybercrime'],
    'Property Law': ['Property Dispute'],
    'Employment Law': ['Employment Issue'],
    'Intellectual Property': ['Intellectual Property'],
    'Consumer Rights': ['Consumer Complaint'],
    'Tax Law': ['Tax Dispute'],
    'Immigration Law': ['Immigration'],
    'Constitutional Law': ['Civil Rights'],
  };

  const categories = [];
  specializations.forEach((spec) => {
    if (map[spec]) {
      categories.push(...map[spec]);
    }
  });

  return [...new Set(categories)]; // Remove duplicates
};

// Notify matching lawyers about a new unassigned case
const notifyMatchingLawyers = async (caseDoc) => {
  try {
    // Find category-to-specialization mapping
    const specMap = {
      'Property Dispute': 'Property Law',
      'Family Matter': 'Family Law',
      'Criminal Case': 'Criminal Law',
      'Employment Issue': 'Employment Law',
      'Cybercrime': 'Cyber Law',
      'Consumer Complaint': 'Consumer Rights',
      'Business Contract': 'Corporate Law',
      'Intellectual Property': 'Intellectual Property',
      'Tax Dispute': 'Tax Law',
      'Immigration': 'Immigration Law',
      'Civil Rights': 'Constitutional Law',
    };

    const specialization = specMap[caseDoc.category] || null;

    const filter = { isVerified: true, isAvailable: true };
    if (specialization) {
      filter.specializations = { $in: [specialization] };
    }

    const matchingLawyers = await Lawyer.find(filter).limit(5);

    for (const lawyer of matchingLawyers) {
      if (lawyer.userId && lawyer.userId.email) {
        await notifyLawyerNewCase(
          lawyer.userId.email,
          lawyer.userId.name,
          {
            category: caseDoc.category,
            title: caseDoc.title,
            priority: caseDoc.priority,
          }
        );
      }
    }

    console.log(`📧 Notified ${matchingLawyers.length} lawyers about case: ${caseDoc.title}`);
  } catch (error) {
    console.error('⚠️ Failed to notify matching lawyers:', error.message);
  }
};
// ========================
// AUTO-ASSIGN BEST LAWYER
// ========================
const findBestLawyerForCategory = async (category) => {
  try {
    // Map case category → lawyer specialization
    const specMap = {
      'Property Dispute': 'Property Law',
      'Family Matter': 'Family Law',
      'Criminal Case': 'Criminal Law',
      'Employment Issue': 'Employment Law',
      'Cybercrime': 'Cyber Law',
      'Consumer Complaint': 'Consumer Rights',
      'Business Contract': 'Corporate Law',
      'Intellectual Property': 'Intellectual Property',
      'Tax Dispute': 'Tax Law',
      'Immigration': 'Immigration Law',
      'Civil Rights': 'Constitutional Law',
    };

    const specialization = specMap[category] || null;

    // Build filter: verified, available, and matching specialization
    const filter = {
      isVerified: true,
      isAvailable: true,
    };

    if (specialization) {
      filter.specializations = { $in: [specialization] };
    }

    // Find the BEST lawyer: sort by rating (desc), then experience (desc), then fewest total cases (asc)
    const bestLawyer = await Lawyer.findOne(filter)
      .sort({ rating: -1, experience: -1, totalCases: 1 })
      .populate('userId', 'name email phone avatar');

    if (bestLawyer) {
      return bestLawyer;
    }

    // Fallback: If no exact specialization match, find any available verified lawyer
    const fallbackLawyer = await Lawyer.findOne({
      isVerified: true,
      isAvailable: true,
    })
      .sort({ rating: -1, experience: -1, totalCases: 1 })
      .populate('userId', 'name email phone avatar');

    return fallbackLawyer || null;
  } catch (error) {
    console.error('⚠️ Auto-assign error:', error.message);
    return null;
  }
};
module.exports = {
  createCase,
  getMyCases,
  getCaseById,
  updateCase,
  getLawyerRequests,
  acceptCase,
  rejectCase,
  resolveCase,
  closeCase,
  addLawyerNotes,
  getCaseStats,
};