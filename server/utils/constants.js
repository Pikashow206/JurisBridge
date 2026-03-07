// ⚖️ JurisBridge Constants

// Legal specializations available on the platform
const SPECIALIZATIONS = [
  'Criminal Law',
  'Family Law',
  'Corporate Law',
  'Civil Litigation',
  'Cyber Law',
  'Property Law',
  'Employment Law',
  'Intellectual Property',
  'Consumer Rights',
  'Tax Law',
  'Immigration Law',
  'Constitutional Law',
];

// Case categories (used by JurisPilot AI for auto-classification)
const CASE_CATEGORIES = [
  'Property Dispute',
  'Family Matter',
  'Criminal Case',
  'Employment Issue',
  'Cybercrime',
  'Consumer Complaint',
  'Business Contract',
  'Intellectual Property',
  'Tax Dispute',
  'Immigration',
  'Civil Rights',
  'Other',
];

// Case status flow
const CASE_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

// User roles
const ROLES = {
  USER: 'user',
  LAWYER: 'lawyer',
  ADMIN: 'admin',
};

// AI Provider names
const AI_PROVIDERS = {
  CLAUDE: 'Claude',
  OPENAI: 'OpenAI',
  GEMINI: 'Gemini',
  HUMAN: 'Human Lawyer',
};

// AI confidence threshold — below this, escalate to human lawyer
const AI_CONFIDENCE_THRESHOLD = 60;

// Supported languages
const LANGUAGES = {
  EN: 'en',
  HI: 'hi',
};

// Evidence file types
const EVIDENCE_TYPES = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  AUDIO: 'audio',
  OTHER: 'other',
};

// Timeline event types (for case activity log)
const TIMELINE_EVENTS = {
  CASE_CREATED: 'case_created',
  LAWYER_NOTIFIED: 'lawyer_notified',
  LAWYER_ASSIGNED: 'lawyer_assigned',
  DOCUMENT_UPLOADED: 'document_uploaded',
  EVIDENCE_ADDED: 'evidence_added',
  MESSAGE_SENT: 'message_sent',
  STATUS_CHANGED: 'status_changed',
  AI_ESCALATED: 'ai_escalated',
  NOTICE_GENERATED: 'notice_generated',
  CASE_RESOLVED: 'case_resolved',
  CASE_CLOSED: 'case_closed',
};

module.exports = {
  SPECIALIZATIONS,
  CASE_CATEGORIES,
  CASE_STATUS,
  ROLES,
  AI_PROVIDERS,
  AI_CONFIDENCE_THRESHOLD,
  LANGUAGES,
  EVIDENCE_TYPES,
  TIMELINE_EVENTS,
};