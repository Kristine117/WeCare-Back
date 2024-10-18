const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { addNewUserHandler, grabSession, fetchAllEmails } = require('../controller/user-controller');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const date = new Date();
    const datePath = path.join(__dirname, '../uploads', date.toISOString().split('T')[0]);
    fs.mkdirSync(datePath, { recursive: true }); // Create the directory if it doesn't exist
    cb(null, datePath); // Set destination folder for uploads
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuidv4()}_${file.originalname}`; // Unique filename to avoid conflicts
    cb(null, uniqueFilename);
  }
});

// File size limit: 400 MB
const upload = multer({
  storage: storage,
  limits: { fileSize: 400 * 1024 * 1024 }, // Set file size limit to 400 MB
  fileFilter: (req, file, cb) => {
    // You can add additional file type validations here, for example:
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept image files
    } else {
      cb(new Error('Only image files are allowed'), false); // Reject non-image files
    }
  }
});

// Apply multer middleware to handle file uploads for registering users
router.post("/register-user", upload.single('profileImage'), addNewUserHandler);  // Add upload.single for handling 'profileImage'

router.get("/register-user", grabSession);

router.get("/get-all-email", fetchAllEmails);

module.exports = router;
