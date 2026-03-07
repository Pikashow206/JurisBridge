const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create temp uploads directory if it doesn't exist
const tempDir = path.join(__dirname, '..', 'tmp', 'uploads');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Storage — save to local temp folder first, then upload to Cloudinary
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter — allowed types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/webp',
    // Documents
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    // Audio
    'audio/mpeg',
    'audio/wav',
    // Text
    'text/plain',
    'text/csv',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type '${file.mimetype}' is not supported. Allowed: JPG, PNG, WEBP, PDF, DOCX, MP3, WAV, TXT, CSV`), false);
  }
};

// Upload instances for different use cases
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// Cleanup temp file after Cloudinary upload
const cleanupTempFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('⚠️ Temp file cleanup failed:', error.message);
  }
};

module.exports = { upload, cleanupTempFile };