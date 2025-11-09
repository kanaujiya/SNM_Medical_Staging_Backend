/**
 * File Upload Configuration using Multer
 * --------------------------------------
 * Handles uploads for:
 * - Profile Images  →  uploads/profile/
 * - Certificates    →  uploads/certificates/
 * - Others          →  uploads/others/
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// -------------------------------------
// ✅ Ensure directory exists
// -------------------------------------
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// -------------------------------------
// 📂 Base uploads directory
// -------------------------------------
const BASE_UPLOAD_DIR = path.join(__dirname, '../../uploads');

// -------------------------------------
// ⚙️ Multer storage configuration
// -------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = 'others';

    switch (file.fieldname) {
      case 'profilePic':
        uploadDir = 'profile';
        break;
      case 'certificate':
        uploadDir = 'certificates';
        break;
    }

    const fullPath = path.join(BASE_UPLOAD_DIR, uploadDir);
    ensureDir(fullPath);
    
    req.uploadSubDir = uploadDir;
    
    cb(null, fullPath);
  },

  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const safeOriginalName = path.basename(file.originalname, path.extname(file.originalname))
      .replace(/\s+/g, '_')
      .replace(/[^\w\-]/g, '');

    const finalFileName = `${safeOriginalName}_${timestamp}_${random}${path.extname(file.originalname)}`;
    cb(null, finalFileName);
  },
});

// -------------------------------------
// 🧩 File validation
// -------------------------------------
const fileFilter = (req, file, cb) => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExts.includes(ext)) {
    return cb(new Error(`Unsupported file type: ${ext}. Allowed: ${allowedExts.join(', ')}`));
  }

  cb(null, true);
};

// -------------------------------------
// 🚀 Create Multer upload instance
// -------------------------------------
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // ✅ 5MB max per file
  },
});

// -------------------------------------
// 🧾 Export upload middleware
// -------------------------------------
module.exports = upload;
