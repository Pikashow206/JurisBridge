const express = require('express');
const router = express.Router();

// Controller
const {
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
} = require('../controllers/caseController');

// Middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// All case routes require authentication
router.use(protect);

// ========================
// USER & SHARED ROUTES
// ========================

// POST /api/cases — Create a new case
router.post('/', authorize('user'), createCase);

// GET /api/cases — Get my cases (works for both user and lawyer)
router.get('/', getMyCases);

// GET /api/cases/stats — Get case statistics for dashboard
router.get('/stats', getCaseStats);

// GET /api/cases/:id — Get single case details
router.get('/:id', getCaseById);

// PUT /api/cases/:id — Update case details (User only)
router.put('/:id', authorize('user'), updateCase);

// PUT /api/cases/:id/close — Close a case (User only)
router.put('/:id/close', authorize('user'), closeCase);

// ========================
// LAWYER ROUTES
// ========================

// GET /api/cases/lawyer/requests — Get pending cases for lawyer
router.get('/lawyer/requests', authorize('lawyer'), getLawyerRequests);

// PUT /api/cases/:id/accept — Accept a case
router.put('/:id/accept', authorize('lawyer'), acceptCase);

// PUT /api/cases/:id/reject — Reject/Decline a case
router.put('/:id/reject', authorize('lawyer'), rejectCase);

// PUT /api/cases/:id/resolve — Resolve a case
router.put('/:id/resolve', authorize('lawyer'), resolveCase);

// PUT /api/cases/:id/notes — Add lawyer notes
router.put('/:id/notes', authorize('lawyer'), addLawyerNotes);

module.exports = router;